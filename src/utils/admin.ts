import { ADMIN_USERS_IDS } from 'astro:env/server'

const ADMIN_IDS = ADMIN_USERS_IDS.split(',')
/**
 * Verifica si un email tiene permisos de administrador
 */
export function isAdmin(id: string | undefined): boolean {
  if (!id) return false
  return ADMIN_IDS.includes(id)
}
