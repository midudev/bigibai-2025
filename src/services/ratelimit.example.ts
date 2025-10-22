import type { APIRoute } from 'astro'
import { checkRateLimit, getRateLimitMessage, getTimeRemaining } from '@/services/ratelimit'

/**
 * Ejemplo de API route con rate limiting
 *
 * Este es un ejemplo de cómo aplicar rate limiting en una API route.
 * Puedes usar este patrón en cualquier endpoint de tu aplicación.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Rate limit por IP: 100 requests por minuto
  const rateLimitResult = await checkRateLimit({
    identifier: clientAddress,
    limit: 100,
    windowMs: 60_000, // 1 minuto
  })

  if (!rateLimitResult.success) {
    const timeRemaining = getTimeRemaining(rateLimitResult.reset)

    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: getRateLimitMessage(rateLimitResult.reset),
        remaining: rateLimitResult.remaining,
        resetAt: rateLimitResult.reset,
        limit: rateLimitResult.limit,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'Retry-After': timeRemaining.seconds.toString(),
        },
      }
    )
  }

  // Tu lógica de negocio aquí...
  const data = await request.json()

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Request procesado correctamente',
      data,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      },
    }
  )
}
