import { defineMiddleware } from 'astro:middleware'
import { createClient } from '@/supabase'

const protectedRoutes = ['/dashboard']
const redirectRoutes = ['/registro']

// Rutas que no necesitan verificación de autenticación
function shouldSkipAuth(pathname: string): boolean {
  // Skip rutas públicas que nunca necesitan auth
  const publicRoutes = ['/aviso-legal', '/bases-legales', '/politica-de-cookies', '/privacidad']

  return publicRoutes.includes(pathname)
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  // Skip auth check para rutas que no lo necesitan
  if (shouldSkipAuth(pathname)) {
    return next()
  }

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
