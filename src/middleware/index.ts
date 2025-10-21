import { defineMiddleware } from 'astro:middleware'
import { createSupabaseAuthClient } from '@/supabase'

const protectedRoutes = ['/dashboard']
const redirectRoutes = ['/registro']

export const onRequest = defineMiddleware(async ({ url, redirect, locals }, next) => {
  const supabase = createSupabaseAuthClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) console.error(error.message)

  const user = data.user
  locals.user = user

  if (protectedRoutes.includes(url.pathname) && !user) {
    return redirect('/sign-in')
  }

  if (redirectRoutes.includes(url.pathname) && user) {
    return redirect('/account')
  }

  return next()
})
