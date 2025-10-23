const ADMIN_IDS = import.meta.env.ADMIN_IDS.split(',')
/**
 * Verifica si un email tiene permisos de administrador
 */
export function isAdmin(id: string | undefined): boolean {
  if (!id) return false
  return ADMIN_IDS.includes(id)
}
