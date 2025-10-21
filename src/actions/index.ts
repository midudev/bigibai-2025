import { saveNewsletterEmail } from "@/newsletter/services/subscribe";
import { getRateLimitMessage } from "@/services/ratelimit";
import { RateLimitPresets } from "@/services/ratelimit-presets";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { supabase } from "@/supabase";
import { supabaseAdmin } from "@/supabase-admin";
import { hash } from "@/utils/crypto";
import { emailSchema } from "@/validations/email";

// Extrae IP real del cliente evitando spoofing básico.
function getClientIp(ctx: any): string {
  const h = ctx?.request?.headers;
  const first = (v?: string | null) => v?.split(",")[0]?.trim();
  return (
    first(h?.get("x-vercel-forwarded-for")) ||
    first(h?.get("cf-connecting-ip")) ||
    first(h?.get("x-real-ip")) ||
    first(h?.get("x-forwarded-for")) ||
    (ctx as any)?.clientAddress ||
    "unknown"
  );
}

// Valida el formato del cupón XXXX-XXXX-XXXX
function validateCouponFormat(coupon: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(coupon);
}

// Normaliza el cupón a mayúsculas y elimina caracteres no válidos
function normalizeCoupon(coupon: string): string {
  return coupon
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "") // Solo letras, números y guiones
    .replace(/-+/g, "-"); // Múltiples guiones a uno solo
}

export const server = {
  newsletter: defineAction({
    input: z.object({
      // Validaciones de entrada: normaliza y bloquea dominios desechables/typos.
      email: emailSchema,
    }),
    // Se aplica rate limit compuesto y se devuelve 429 explícito al bloquear.
    async handler({ email }, ctx) {
      // Sanitización adicional en el servidor
      const ip = getClientIp(ctx);

      // Email 5/h, IP 15/h, global 500/h.
      const [byEmail, byIp] = await Promise.all([
        RateLimitPresets.email(email),
        RateLimitPresets.ip(ip),
      ]);

      const failed =
        (!byEmail.success && { kind: "email", res: byEmail }) ||
        (!byIp.success && { kind: "ip", res: byIp }) ||
        null;

      if (failed) {
        // Log útil: bucket que bloqueó y cuándo reinicia.
        console.warn("[RATE_LIMIT_BLOCK]", {
          bucket: failed.kind,
          reset: failed.res.reset,
          ip,
          email,
        });

        // Acción correcta en Actions: lanzar ActionError para 429 consistente.
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: getRateLimitMessage(failed.res.reset),
        });
      }

      const { success, duplicated, error } = await saveNewsletterEmail(email);

      if (!success) {
        // Log de error operativo útil.
        console.error("[NEWSLETTER_SAVE_ERROR]", {
          ip,
          email,
          error,
        });
        throw new ActionError({
          code: "BAD_REQUEST",
          message: error ?? "Error al guardar el email en la newsletter",
        });
      }

      if (duplicated) {
        // Mantener BAD_REQUEST para UX actual, pero con mensaje claro.
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "¡Este usuario ya estaba en la newsletter!",
        });
      }

      return { success: true, message: "¡Te has suscrito a la newsletter!" };
    },
  }),

  sendMagicLink: defineAction({
    input: z.object({
      email: emailSchema,
    }),
    async handler({ email }, ctx) {
      const ip = getClientIp(ctx);

      // Rate limiting estricto para magic links (envío de emails es costoso)
      // 3 intentos por email cada 5 minutos, 10 intentos por IP cada hora
      const [byEmail, byIp] = await Promise.all([
        RateLimitPresets.expensive(email),
        RateLimitPresets.antiSpam(ip),
      ]);

      const failed =
        (!byEmail.success && { kind: "email", res: byEmail }) ||
        (!byIp.success && { kind: "ip", res: byIp }) ||
        null;

      if (failed) {
        console.warn("[RATE_LIMIT_BLOCK_MAGIC_LINK]", {
          bucket: failed.kind,
          reset: failed.res.reset,
          ip,
          email: email,
        });

        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: getRateLimitMessage(failed.res.reset),
        });
      }

      try {
        // Enviar el magic link usando Supabase Auth
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${ctx.url.origin}/api/auth/callback`,
          },
        });

        if (error) {
          console.error("[MAGIC_LINK_ERROR]", {
            ip,
            email: email,
            error: error.message,
          });

          // No revelar si el email existe o no por seguridad
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "Error al enviar el enlace mágico. Inténtalo de nuevo más tarde.",
          });
        }

        return {
          success: true,
          message:
            "¡Revisa tu email! Te hemos enviado un enlace para iniciar sesión",
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error("[MAGIC_LINK_UNEXPECTED_ERROR]", {
          ip,
          email: email,
          error,
        });

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error inesperado al procesar la solicitud",
        });
      }
    },
  }),

  validateCoupon: defineAction({
    input: z.object({
      coupon: z
        .string({
          required_error: "El código del cupón es requerido",
          invalid_type_error: "El código del cupón debe ser un texto",
        })
        .trim()
        .min(1, "El código del cupón no puede estar vacío")
        .max(15, "El código del cupón es demasiado largo"),
    }),
    async handler({ coupon }, ctx) {
      // check we have a user logged in before validating the coupon
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new ActionError({
          code: "UNAUTHORIZED",
          message: "Debes iniciar sesión para validar cupones",
        });
      }

      const ip = getClientIp(ctx);

      // Rate limiting para validación de cupones
      const [byIp] = await Promise.all([RateLimitPresets.ip(ip)]);

      const failed = (!byIp.success && { kind: "ip", res: byIp }) || null;

      if (failed) {
        console.warn("[RATE_LIMIT_BLOCK_COUPON]", {
          bucket: failed.kind,
          reset: failed.res.reset,
          ip,
        });

        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: getRateLimitMessage(failed.res.reset),
        });
      }

      // Normalizar y validar formato del cupón
      const normalizedCoupon = normalizeCoupon(coupon);

      if (!validateCouponFormat(normalizedCoupon)) {
        throw new ActionError({
          code: "BAD_REQUEST",
          message:
            "El formato del cupón debe ser XXXX-XXXX-XXXX (solo letras y números)",
        });
      }

      try {
        // Generar hash del cupón para buscar en la base de datos
        const couponHash = hash(normalizedCoupon);

        // Buscar el cupón en la base de datos
        const { data: couponData, error: fetchError } = await supabaseAdmin
          .from("coupons")
          .select("is_used, used_by, id")
          .eq("hash", couponHash)
          .single();

        // Si hay error O no hay datos, el cupón no es válido
        if (fetchError || !couponData) {
          // Si el error es "PGRST116" significa que no se encontró el registro
          if (fetchError?.code === "PGRST116") {
            throw new ActionError({
              code: "BAD_REQUEST",
              message: "El cupón no es válido",
            });
          }

          // Si hay otro tipo de error, es un error interno
          if (fetchError) {
            console.error("[COUPON_FETCH_ERROR]", {
              ip,
              coupon: normalizedCoupon,
              error: fetchError,
            });
            throw new ActionError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error al verificar el cupón",
            });
          }

          // Si no hay error pero tampoco hay datos
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "El cupón no es válido",
          });
        }

        // Verificar si el cupón ya está usado
        if (couponData.is_used) {
          throw new ActionError({
            code: "BAD_REQUEST",
            message: "Este cupón ya ha sido utilizado",
          });
        }

        // Marcar el cupón como usado
        const { error: updateError } = await supabaseAdmin
          .from("coupons")
          .update({
            is_used: true,
            used_at: new Date().toISOString(),
            used_by: user.id,
          })
          .eq("id", couponData.id);

        if (updateError) {
          console.error("[COUPON_UPDATE_ERROR]", {
            ip,
            userId: user.id,
            couponId: couponData.id,
            error: updateError,
          });
          throw new ActionError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al marcar el cupón como usado",
          });
        }

        // Obtener el número total de cupones validados por este usuario
        const { data: userCoupons, error: countError } = await supabaseAdmin
          .from("coupons")
          .select("id")
          .eq("used_by", user.id)
          .eq("is_used", true);

        if (countError) {
          console.error("[COUPON_COUNT_ERROR]", {
            userId: user.id,
            error: countError,
          });
        }

        const totalCoupons = userCoupons?.length || 1;

        return {
          success: true,
          message: "¡Cupón validado correctamente!",
          totalCoupons,
        };
      } catch (error) {
        if (error instanceof ActionError) {
          throw error;
        }

        console.error("[COUPON_VALIDATION_ERROR]", {
          ip,
          coupon: normalizedCoupon,
          error,
        });

        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error interno al validar el cupón",
        });
      }
    },
  }),
};
