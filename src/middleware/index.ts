import { defineMiddleware } from 'astro:middleware'
import { createClient } from '@/supabase'

const protectedRoutes = ['/dashboard']
const redirectRoutes = ['/registro']

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  const supabase = createClient({
    request: context.request,
    cookies: context.cookies,
  })

  const { data } = await supabase.auth.getUser()

  if (!data.user && protectedRoutes.includes(pathname)) {
    return context.redirect('/registro')
  }

  if (data.user && redirectRoutes.includes(pathname)) {
    return context.redirect('/dashboard')
  }

  context.locals.user = data.user

  return next()
})
