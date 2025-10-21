import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const HAS_UPSTASH =
  !!import.meta.env.UPSTASH_REDIS_REST_URL && !!import.meta.env.UPSTASH_REDIS_REST_TOKEN

// Singleton Redis y cache de limiters por (limit, windowMs).
let redis: Redis | null = null
const limiterCache = new Map<string, Ratelimit>()

function getLimiter(limit: number, windowMs: number): Ratelimit {
  if (!redis) {
    // Nota: solo se crea si HAS_UPSTASH es true.
    redis = new Redis({
      url: import.meta.env.UPSTASH_REDIS_REST_URL!,
      token: import.meta.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  }
  const key = `${limit}:${windowMs}`
  let limiter = limiterCache.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: true,
      prefix: '@bigibai/ratelimit',
    })
    limiterCache.set(key, limiter)
  }
  return limiter
}

interface RateLimitOptions {
  /** Identificador único para el rate limit (ej: email, IP, user ID) */
  identifier: string
  /** Número máximo de requests permitidos */
  limit: number
  /** Ventana de tiempo en milisegundos */
  windowMs: number
}

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number | Date
  pending: Promise<void>
}

// Fallback en memoria por proceso: clave = identifier, ventana deslizante simple.
const memory = new Map<string, { count: number; reset: number }>()

function memoryCheck(identifier: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = memory.get(identifier)
  if (!entry || now >= entry.reset) {
    const reset = now + windowMs
    memory.set(identifier, { count: 1, reset })
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset,
      pending: Promise.resolve(),
    }
  }
  if (entry.count < limit) {
    entry.count += 1
    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: entry.reset,
      pending: Promise.resolve(),
    }
  }
  return {
    success: false,
    limit,
    remaining: 0,
    reset: entry.reset,
    pending: Promise.resolve(),
  }
}

/**
 * Servicio de rate limiting reutilizable.
 * Usa Upstash si está disponible, de lo contrario memoria local.
 */
export async function checkRateLimit({
  identifier,
  limit,
  windowMs,
}: RateLimitOptions): Promise<RateLimitResult> {
  if (!HAS_UPSTASH) {
    // Dev/test sin Upstash: no fallar, aplicar ventana en memoria.
    return memoryCheck(identifier, limit, windowMs)
  }

  try {
    const result = await getLimiter(limit, windowMs).limit(identifier)
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending,
    }
  } catch (error) {
    // En producción se puede elegir fail-open o fail-closed.
    // Aquí: se degrada a memoria para no romper el endpoint.
    console.warn('[RATELIMIT_BACKEND_ERROR]', error)
    return memoryCheck(identifier, limit, windowMs)
  }
}

/**
 * Calcula el tiempo restante hasta el reset en diferentes unidades.
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
 * Genera un mensaje de error amigable con el tiempo restante.
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
