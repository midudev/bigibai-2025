import { supabase } from "@/supabase"

/**
 * Obtiene el conteo total de suscriptores
 * @returns Número de suscriptores
 */
export const getNewsletterCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('newsletter')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error al contar suscriptores:', error)
    throw new Error('Error al contar suscriptores')
  }

  return count || 0
}
