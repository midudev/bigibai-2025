import type { APIRoute } from 'astro'
import type { Provider } from '@supabase/supabase-js'

import { createSupabaseClient } from '@/supabase'

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const formData = await request.formData()
  const provider = formData.get('provider')?.toString()

  const validProviders = ['google']

  const supabase = createSupabaseClient()

  if (provider && validProviders.includes(provider)) {
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
