import { getNewsletterCount } from "@/newsletter/services/getEmails";
import { saveNewsletterEmail } from "@/newsletter/services/subscribe";
import { getRateLimitMessage } from "@/services/ratelimit";
import { RateLimitPresets } from "@/services/ratelimit-presets";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

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

export const server = {
  newsletter: defineAction({
    input: z.object({
      // Validaciones de entrada: normaliza y bloquea dominios desechables/typos.
      email: z
        .string({
          required_error: "El email es requerido",
          invalid_type_error: "El email debe ser un texto",
        })
        .trim() // Elimina espacios en blanco
        .min(1, "El email no puede estar vacío")
        .email("El formato del email no es válido")
        .toLowerCase() // Normaliza a minúsculas
        .max(255, "El email es demasiado largo")
        // Validación adicional para dominios comunes mal escritos
        .refine(
          (email) => {
            const commonTypos = [
              "gmial.com",
              "gmai.com",
              "yahooo.com",
              "hotmial.com",
            ];
            const domain = email.split("@")[1];
            return !commonTypos.includes(domain);
          },
          { message: "Verifica que el dominio del email esté bien escrito" }
        )
        // Validación para evitar emails temporales/desechables
        .refine(
          (email) => {
            const disposable = [
              "tempmail.com",
              "throwaway.email",
              "10minutemail.com",
              "guerrillamail.com",
              "mailinator.com",
              "yopmail.com",
              "temp-mail.org",
              "disposablemail.com",
              "sharklasers.com",
              "emailondeck.com",
              "tempinbox.com",
              "dispostable.com",
              "tempmailaddress.com",
              "fake-email.com",
              "temporary-mail.net",
              "tmpmail.org",
              "trashmail.com",
              "wegwerfmail.de",
              "mohmal.com",
              "tempmail.ninja"
            ];
            const domain = email.split("@")[1];
            return !disposable.includes(domain);
          },
          { message: "Por favor, usa un email permanente" }
        ),
          }),
    // Se aplica rate limit compuesto y se devuelve 429 explícito al bloquear.
    async handler({ email }, ctx) {
      // Sanitización adicional en el servidor
      const sanitizedEmail = email.trim().toLowerCase();
      const ip = getClientIp(ctx);

      // Email 5/h, IP 15/h, global 500/h.
      const [byEmail, byIp, byGlobal] = await Promise.all([
        RateLimitPresets.email(sanitizedEmail),
        RateLimitPresets.ip(ip),
        RateLimitPresets.globalNewsletter(),
      ]);

      const failed =
        (!byEmail.success && { kind: "email", res: byEmail }) ||
        (!byIp.success && { kind: "ip", res: byIp }) ||
        (!byGlobal.success && { kind: "global", res: byGlobal }) ||
        null;

      if (failed) {
        // Log útil: bucket que bloqueó y cuándo reinicia.
        console.warn("[RATE_LIMIT_BLOCK]", {
          bucket: failed.kind,
          reset: failed.res.reset,
          ip,
          email: sanitizedEmail,
        });

        // Acción correcta en Actions: lanzar ActionError para 429 consistente.
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: getRateLimitMessage(failed.res.reset),
        });
      }

      const { success, duplicated, error } = await saveNewsletterEmail(
        sanitizedEmail
      );

      if (!success) {
        // Log de error operativo útil.
        console.error("[NEWSLETTER_SAVE_ERROR]", {
          ip,
          email: sanitizedEmail,
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

  getNewsletterCount: defineAction({
    async handler() {
      try {
        const count = await getNewsletterCount();
        return { count };
      } catch {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener el conteo de suscriptores",
        });
      }
    },
  }),
};
