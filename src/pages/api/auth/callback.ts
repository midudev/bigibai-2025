import { supabase } from '@/supabase'
import { type APIRoute } from 'astro'

export const GET: APIRoute = async ({ url, request, cookies, redirect }) => {
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/registro'

  if (!code) {
    return redirect('/registro?error=no_code')
  }

  console.log({ code })

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log({ data, error })
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return redirect('/registro?error=auth_failed')
    }
    
    if (data.session) {
      const { access_token, refresh_token } = data.session
      cookies.set('access_token', access_token, {
        path: '/',
      })
      cookies.set('refresh_token', refresh_token, {
        path: '/',
      })
      return redirect(next)
    }
  } catch (error) {
    console.error('Unexpected error in OAuth callback:', error)
    return redirect('/registro?error=auth_failed')
  }

  return redirect(next)
}