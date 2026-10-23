import { TURNSTILE_SECRET_KEY } from 'astro:env/server'

// Supabase Auth no comprueba el CAPTCHA en las peticiones con clave secreta (src/supabase.ts):
// el token de Turnstile se valida aquí. En local, la clave secreta de pruebas, que siempre pasa
// (el widget usa la clave de sitio de pruebas, ver src/utils/turnstile.ts)
const SECRET_KEY = import.meta.env.DEV ? '1x0000000000000000000000000000000AA' : TURNSTILE_SECRET_KEY
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Valida con Cloudflare el token del widget. Cada token solo se puede validar una vez
 */
export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!SECRET_KEY) {
    console.error('[TURNSTILE] Falta TURNSTILE_SECRET_KEY')
    return false
  }

  const body = new URLSearchParams({ secret: SECRET_KEY, response: token })
  if (ip !== 'unknown') body.set('remoteip', ip)

  try {
    const response = await fetch(SITEVERIFY_URL, { method: 'POST', body })
    const { success } = (await response.json()) as { success: boolean }
    return success === true
  } catch (error) {
    console.error('[TURNSTILE] Error al validar el token', error)
    return false
  }
}
