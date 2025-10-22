import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { AstroCookies } from 'astro'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY

export function createClient({ request, cookies }: { request: Request; cookies: AstroCookies }) {
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '')
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookies.set(name, value, options))
      },
    },
  })
}

export const supabaseBrowserClient = createBrowserClient(supabaseUrl, supabaseKey)
