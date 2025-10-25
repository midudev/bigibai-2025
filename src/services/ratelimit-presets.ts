import { checkRateLimit } from './ratelimit'

const ONE_MINUTE = 60_000
const ONE_HOUR = 60 * ONE_MINUTE

const bucket = (prefix: string, id: string) => `${prefix}:${id}`

/**
 * Presets comunes de rate limiting para diferentes casos de uso
 */
export const RateLimitPresets = {
  /**
   * Para APIs públicas sensibles (login, registro, etc.)
   * 10 intentos por hora
   */
  strict: (identifier: string) => checkRateLimit({ identifier, limit: 10, windowMs: ONE_HOUR }),

  /**
   * Para APIs de uso normal
   * 60 requests por minuto
   */
  moderate: (identifier: string) => checkRateLimit({ identifier, limit: 60, windowMs: ONE_MINUTE }),

  /**
   * Para APIs de alto tráfico
   * 1000 requests por minuto
   */
  relaxed: (identifier: string) =>
    checkRateLimit({ identifier, limit: 1000, windowMs: ONE_MINUTE }),

  /**
   * Para protección anti-spam
   * 3 requests por minuto
   */
  antiSpam: (identifier: string) => checkRateLimit({ identifier, limit: 3, windowMs: ONE_MINUTE }),

  /**
   * Para operaciones costosas (envío de emails, procesamiento pesado, etc.)
   * 3 requests por 5 minutos
   */
  expensive: (identifier: string) =>
    checkRateLimit({ identifier, limit: 3, windowMs: 5 * ONE_MINUTE }),

  /**
   * Presets para la mitigación de vulnerabilidades
   */

  /**
   * Rate limiting por dirección de email para prevenir abuso
   * Limita a 5 intentos por hora por email específico
   */
  email: (emailId: string) =>
    checkRateLimit({
      identifier: bucket('email', emailId),
      limit: 5,
      windowMs: ONE_HOUR,
    }),

  /**
   * Rate limiting por dirección IP para prevenir ataques distribuidos
   * Limita a 15 intentos por hora por dirección IP
   */
  ip: (ipAddr: string) =>
    checkRateLimit({
      identifier: bucket('ip', ipAddr),
      limit: 15,
      windowMs: ONE_HOUR,
    }),
} as const

/**
 * Ejemplo de uso:
 *
 * ```typescript
 * import { RateLimitPresets } from '@/services/ratelimit-presets'
 *
 * // En una action
 * const result = await RateLimitPresets.strict(email)
 * if (!result.success) {
 *   throw new Error('Too many attempts')
 * }
 * ```
 */
