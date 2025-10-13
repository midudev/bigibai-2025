import { saveNewsletterEmail } from "@/newsletter/services/subscribe";
import { getRateLimitMessage } from "@/services/ratelimit";
import { RateLimitPresets } from "@/services/ratelimit-presets";
import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";

export const server = {
  newsletter: defineAction({
    input: z.object({
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
            const disposableDomains = [
              "tempmail.com",
              "throwaway.email",
              "10minutemail.com",
              "guerrillamail.com",
              "mailinator.com",
              "yopmail.com",
            ];
            const domain = email.split("@")[1];
            return !disposableDomains.includes(domain);
          },
          { message: "Por favor, usa un email permanente" }
        ),
    }),
    async handler({ email }) {
      // Sanitización adicional en el servidor
      const sanitizedEmail = email.trim().toLowerCase();
      // Rate limiting: protección anti-spam
      const rateLimitResult = await RateLimitPresets.strict(sanitizedEmail)

      if (!rateLimitResult.success) {
        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: getRateLimitMessage(rateLimitResult.reset)
        })
      }

      const { success, duplicated, error } = await saveNewsletterEmail(
        sanitizedEmail
      );

      if (!success) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: error ?? "Error al guardar el email en la newsletter"
        })
      }

      if (duplicated) {
        return {
          success: true,
          message: "¡Este usuario ya estaba en la newsletter!"
        }
      }

      return {
        success: true,
        message: "¡Te has suscrito a la newsletter!"
      }
    }
  })
}