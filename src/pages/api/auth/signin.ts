import type { APIRoute } from 'astro'
import type { Provider } from '@supabase/supabase-js'

import { createClient } from '@/supabase'

export const POST: APIRoute = async ({ request, url, redirect, cookies }) => {
  const formData = await request.formData()
  const provider = formData.get('provider')?.toString()

  const validProviders = ['google']

  if (provider && validProviders.includes(provider)) {
    const supabase = createClient({ request, cookies })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${url.origin}/api/auth/callback`,
      },
    })

    if (error) {
      return new Response(error.message, { status: 500 })
    }

    return redirect(data.url)
  }

  return redirect('/registro?error=invalid_provider')
}
