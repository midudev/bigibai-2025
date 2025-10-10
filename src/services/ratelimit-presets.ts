import { checkRateLimit } from './ratelimit'

/**
 * Presets comunes de rate limiting para diferentes casos de uso
 */
export const RateLimitPresets = {
  /**
   * Para APIs públicas sensibles (login, registro, etc.)
   * 5 intentos por hora
   */
  strict: (identifier: string) => checkRateLimit({
    identifier,
    limit: 5,
    windowMs: 3_600_000 // 1 hora
  }),

  /**
   * Para APIs de uso normal
   * 60 requests por minuto
   */
  moderate: (identifier: string) => checkRateLimit({
    identifier,
    limit: 60,
    windowMs: 60_000 // 1 minuto
  }),

  /**
   * Para APIs de alto tráfico
   * 1000 requests por minuto
   */
  relaxed: (identifier: string) => checkRateLimit({
    identifier,
    limit: 1000,
    windowMs: 60_000 // 1 minuto
  }),

  /**
   * Para protección anti-spam
   * 10 requests por minuto
   */
  antiSpam: (identifier: string) => checkRateLimit({
    identifier,
    limit: 10,
    windowMs: 60_000 // 1 minuto
  }),

  /**
   * Para operaciones costosas (envío de emails, procesamiento pesado, etc.)
   * 3 requests por 5 minutos
   */
  expensive: (identifier: string) => checkRateLimit({
    identifier,
    limit: 3,
    windowMs: 300_000 // 5 minutos
  }),
}

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
