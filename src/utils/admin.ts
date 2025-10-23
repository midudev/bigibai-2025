/**
 * Lista de emails autorizados para acceder al panel de administración
 */
export const ADMIN_EMAILS = [
  'miduga@gmail.com',
  'peman.apg@gmail.com',
  'adriansatue@gmail.com',
  'alvarez.fing@gmail.com',
]

/**
 * Verifica si un email tiene permisos de administrador
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}
