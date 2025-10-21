import { createClient } from '@/supabase'
import { type APIRoute } from 'astro'

const allowedPaths = ['/dashboard', '/registro', '/']

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/registro'
  const safePath = allowedPaths.includes(next) ? next : '/registro'
  const providerType = url.searchParams.get('type') || 'google'

  console.log({ code, next, safePath, providerType })

  if (!code) {
    return redirect('/registro?error=no_code')
  }

  // CRÍTICO: Cliente con acceso a cookies para PKCE
  const supabase = createClient({ request, cookies })

  try {
    const verifyCodePromise =
      providerType === 'otp'
        ? supabase.auth.verifyOtp({
            token_hash: code,
            type: 'email',
          })
        : supabase.auth.exchangeCodeForSession(code)

    const { data, error } = await verifyCodePromise

    if (error) {
      console.error('Error exchanging code for session:', error)
      return redirect('/registro?error=auth_failed')
    }

    if (data.session) {
      // Las cookies se guardan automáticamente por el storage personalizado
      return redirect(safePath)
    }
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error)
    return redirect(`/registro?error=auth_failed`)
  }

  return redirect(safePath)
}
