import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Crear instancia de Redis
const redis = new Redis({
  url: import.meta.env.UPSTASH_REDIS_REST_URL,
  token: import.meta.env.UPSTASH_REDIS_REST_TOKEN,
})

interface RateLimitOptions {
  /**
   * Identificador único para el rate limit (ej: email, IP, user ID)
   */
  identifier: string
  /**
   * Número máximo de requests permitidos
   */
  limit: number
  /**
   * Ventana de tiempo en milisegundos
   * Ejemplos: 10_000 (10s), 60_000 (1m), 3_600_000 (1h)
   */
  windowMs: number
}

/**
 * Servicio de rate limiting reutilizable usando Upstash
 * 
 * @example
 * ```ts
 * const { success, remaining, reset } = await checkRateLimit({
 *   identifier: email,
 *   limit: 5,
 *   windowMs: 3_600_000 // 1 hora
 * })
 * 
 * if (!success) {
 *   throw new Error("Too many requests")
 * }
 * ```
 */
export async function checkRateLimit({ identifier, limit, windowMs }: RateLimitOptions) {
  // Crear instancia de rate limiter con sliding window
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: true,
    prefix: "@bigibai/ratelimit",
  })

  try {
    const result = await ratelimit.limit(identifier)

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending,
    }
  } catch (error) {
    console.error("Rate limit error:", error)
    
    // En caso de error, permitir la request (fail open)
    // Puedes cambiar esto a fail closed si prefieres denegar en caso de error
    return {
      success: true,
      limit,
      remaining: limit,
      reset: new Date(Date.now() + windowMs),
      pending: Promise.resolve(),
    }
  }
}

/**
 * Calcula el tiempo restante hasta el reset en diferentes unidades
 * 
 * @param reset - Timestamp en milisegundos o Date del reset
 * @returns Objeto con el tiempo restante en diferentes unidades
 * 
 * @example
 * ```ts
 * const result = await checkRateLimit({ ... })
 * if (!result.success) {
 *   const timeRemaining = getTimeRemaining(result.reset)
 *   console.log(`Intenta de nuevo en ${timeRemaining.minutes} minutos`)
 * }
 * ```
 */
export function getTimeRemaining(reset: number | Date) {
  const resetTime = typeof reset === 'number' ? reset : reset.getTime()
  const now = Date.now()
  const msRemaining = Math.max(0, resetTime - now)

  return {
    milliseconds: msRemaining,
    seconds: Math.ceil(msRemaining / 1000),
    minutes: Math.ceil(msRemaining / 60000),
    hours: Math.ceil(msRemaining / 3600000),
  }
}

/**
 * Genera un mensaje de error amigable con el tiempo restante
 * 
 * @param reset - Timestamp en milisegundos o Date del reset
 * @param customMessage - Mensaje personalizado (opcional)
 * @returns Mensaje formateado con el tiempo restante
 * 
 * @example
 * ```ts
 * const result = await checkRateLimit({ ... })
 * if (!result.success) {
 *   throw new Error(getRateLimitMessage(result.reset))
 * }
 * ```
 */
export function getRateLimitMessage(reset: number | Date, customMessage?: string): string {
  const time = getTimeRemaining(reset)
  
  if (time.minutes < 1) {
    return customMessage ?? `Demasiados intentos. Intenta de nuevo en ${time.seconds} segundos`
  }
  
  if (time.minutes < 60) {
    return customMessage ?? `Demasiados intentos. Intenta de nuevo en ${time.minutes} minutos`
  }
  
  return customMessage ?? `Demasiados intentos. Intenta de nuevo en ${time.hours} horas`
}

