import { defineAction, ActionError } from 'astro:actions';
import { z } from 'zod';

export const server = {
  newsletter: defineAction({
    input: z.object({
      email: z.string().email('¡Lo siento! El email no es válido')
    }),
    async handler({ email }) {
      // Importación dinámica para evitar errores en tiempo de carga
      const { saveNewsletterEmail } = await import('../newsletter/services/subscribe');
      
      const { success, duplicated, error } = await saveNewsletterEmail(email)

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