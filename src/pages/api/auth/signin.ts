import type { APIRoute } from 'astro'
import type { Provider } from '@supabase/supabase-js'

import { createClient } from '@/supabase'
import { CAMPAIGN } from '@/data/campaign'

export const POST: APIRoute = async ({ request, url, redirect, cookies }) => {
  if (!CAMPAIGN.signInEnabled) return redirect('/registro')

  const formData = await request.formData()
  const provider = formData.get('provider')?.toString()
  const redirectPath = formData.get('redirect')?.toString() || '/dashboard'

  const validProviders = ['google']

  if (provider && validProviders.includes(provider)) {
    const supabase = createClient({ request, cookies })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${url.origin}/api/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    })

    if (error) {
      console.error('Error starting OAuth sign in:', error)
      return redirect('/registro?error=auth_failed')
    }

    return redirect(data.url)
  }

  return redirect('/registro?error=invalid_provider')
}
