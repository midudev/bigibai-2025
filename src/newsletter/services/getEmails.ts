import { supabase } from "@/supabase"
import NewsletterCountingError from "@/errors/NewsletterCountingError"

/**
 * Obtiene el conteo total de suscriptores
 * @returns Número de suscriptores
 */
export const getNewsletterCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('newsletter')
    .select('*', { count: 'exact', head: true })

  if (error) {
    throw new NewsletterCountingError('Error al contar suscriptores:', error).log()
  }

  return count || 0
}
