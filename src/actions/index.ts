import { saveNewsletterEmail } from '@/newsletter/services/subscribe';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  newsletter: defineAction({
    input: z.object({
      email: z.string().email('¡Lo siento! El email no es válido')
    }),
    async handler({ email }) {
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