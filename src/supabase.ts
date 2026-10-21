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
            maxAge: 60 * 60 * 24 * 7, // 1 week
          })
        })
      },
    },
  })
}
