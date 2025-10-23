import { defineMiddleware } from 'astro:middleware'
import { createClient } from '@/supabase'

const protectedRoutes = ['/dashboard', '/admin']
const redirectRoutes = ['/registro']
const publicRoutes = ['/aviso-legal', '/bases-legales', '/politica-de-cookies', '/privacidad']

// Rutas que no necesitan verificación de autenticación
function shouldSkipAuth(pathname: string): boolean {
  // Skip rutas públicas que nunca necesitan auth
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

  // Verificar si es una ruta protegida (incluye rutas que empiezan con /admin)
  const isProtectedRoute = protectedRoutes.includes(pathname)

  if (!data.user && isProtectedRoute) {
    return context.redirect('/registro')
  }

  if (data.user && redirectRoutes.includes(pathname)) {
    return context.redirect('/dashboard')
  }

  context.locals.user = data.user

  return next()
})
