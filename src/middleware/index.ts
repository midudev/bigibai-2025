import { defineMiddleware, sequence } from 'astro:middleware'
import type { APIContext } from 'astro'
import { createClient } from '@/supabase'
import { isAdmin } from '@/utils/admin'
import { parseSimulatedDate } from '@/utils/campaign'

const protectedRoutes = ['/dashboard', '/admin']
const redirectRoutes = ['/registro']
const publicRoutes = ['/aviso-legal', '/bases-legales', '/politica-de-cookies', '/privacidad', '/api/locations', '/api/auth/signin', '/api/auth/callback', '/api/auth/signout']

const SIMULATED_DATE_PARAM = 'fecha'
const SIMULATED_DATE_COOKIE = 'fecha-simulada'

// www.bigibai.com (de `site` en astro.config.mjs). El dominio raíz redirige aquí
const CANONICAL_HOST = new URL(import.meta.env.SITE).hostname
const APEX_HOST = CANONICAL_HOST.replace(/^www\./, '')

// Los estáticos reciben las mismas cabeceras desde public/_headers
const SECURITY_HEADERS = {
  'X-DNS-Prefetch-Control': 'on',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // Sin restringir scripts ni estilos (Leaflet y Google Fonts vienen de CDNs externos)
  'Content-Security-Policy':
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests",
}
const HSTS_HEADER = 'max-age=63072000; includeSubDomains; preload'

// Rutas que no necesitan verificación de autenticación
function shouldSkipAuth(pathname: string): boolean {
  // Skip rutas públicas que nunca necesitan auth
  return publicRoutes.includes(pathname)
}

// Los admins (y cualquiera en local) pueden simular la fecha con ?fecha=YYYY-MM-DD para probar
// los desbloqueos. Se guarda en una cookie y se quita con ?fecha=off
function canSimulateDate(userId?: string): boolean {
  return import.meta.env.DEV || isAdmin(userId)
}

function resolveNow(context: APIContext, userId?: string) {
  const realNow = { now: new Date(), isSimulatedDate: false }
  if (!canSimulateDate(userId)) return realNow

  const param = context.url.searchParams.get(SIMULATED_DATE_PARAM)

  if (param !== null) {
    const simulated = parseSimulatedDate(param)

    if (!simulated) {
      context.cookies.delete(SIMULATED_DATE_COOKIE, { path: '/' })
      return realNow
    }

    context.cookies.set(SIMULATED_DATE_COOKIE, param, { path: '/', httpOnly: true, sameSite: 'lax' })
    return { now: simulated, isSimulatedDate: true }
  }

  const cookie = context.cookies.get(SIMULATED_DATE_COOKIE)?.value
  const simulated = cookie ? parseSimulatedDate(cookie) : null

  return simulated ? { now: simulated, isSimulatedDate: true } : realNow
}

function setSecurityHeaders(response: Response, url: URL) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  if (url.protocol === 'https:') response.headers.set('Strict-Transport-Security', HSTS_HEADER)

  // Solo se indexa el dominio canónico (no workers.dev ni previews)
  if (url.hostname !== CANONICAL_HOST) response.headers.set('X-Robots-Tag', 'noindex')

  // El HTML depende de la sesión: que ninguna caché compartida lo guarde
  if (!response.headers.has('Cache-Control')) {
    response.headers.set('Cache-Control', 'private, no-cache')
  }
}

// bigibai.com -> www.bigibai.com (lo que hacía Vercel)
const canonicalHost = defineMiddleware((context, next) => {
  if (context.url.hostname !== APEX_HOST) return next()

  const url = new URL(context.url)
  url.hostname = CANONICAL_HOST
  return context.redirect(url.toString(), 308)
})

const securityHeaders = defineMiddleware(async (context, next) => {
  const response = await next()

  try {
    setSecurityHeaders(response, context.url)
    return response
  } catch {
    // Algunas respuestas (p. ej. Response.redirect) tienen las cabeceras inmutables
    const copy = new Response(response.body, response)
    setSecurityHeaders(copy, context.url)
    return copy
  }
})

const auth = defineMiddleware(async (context, next) => {
  const { pathname } = context.url

  // Skip auth check para rutas que no lo necesitan
  if (shouldSkipAuth(pathname)) {
    Object.assign(context.locals, resolveNow(context))
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
  Object.assign(context.locals, resolveNow(context, data.user?.id))

  return next()
})

export const onRequest = sequence(securityHeaders, canonicalHost, auth)
