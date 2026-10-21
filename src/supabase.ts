import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'
import { PUBLIC_SUPABASE_KEY, PUBLIC_SUPABASE_URL } from 'astro:env/server'

export function createClient({ request, cookies }: { request: Request; cookies: AstroCookies }) {
  return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, {
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
