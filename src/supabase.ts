import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'
import { PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY } from 'astro:env/server'

// Solo para Supabase Auth. Va con la clave secreta: sin sesión de usuario, una consulta a la base de
// datos desde este cliente tendría permisos de admin
export function createClient({ request, cookies }: { request: Request; cookies: AstroCookies }) {
  // Supabase Auth limita por IP y todas las peticiones del Worker le llegan desde la misma IP de
  // Cloudflare: sin esto, los límites serían compartidos por toda la web
  const clientIp = request.headers.get('cf-connecting-ip')

  return createServerClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
    global: { headers: clientIp ? { 'sb-forwarded-for': clientIp } : {} },
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '')
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, {
            ...options,
            // 1 week. maxAge 0 es como borra Supabase las cookies al cerrar sesión: se respeta
            maxAge: options.maxAge === 0 ? 0 : 60 * 60 * 24 * 7,
            // Supabase solo se usa en el servidor: el JS de la página no necesita leer la sesión,
            // así que un XSS no podría robarla
            httpOnly: true,
            secure: !import.meta.env.DEV,
          })
        })
      },
    },
  })
}
