import { getRateLimitMessage } from '@/services/ratelimit'
import { RateLimitPresets } from '@/services/ratelimit-presets'
import { ActionError, defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { supabaseAdmin } from '@/supabase-admin'
import { createClient } from '@/supabase'
import { hash } from '@/utils/crypto'
import { emailSchema } from '@/validations/email'
import { grantAchievement } from '@/utils/achievements'

// Extrae IP real del cliente evitando spoofing básico.
function getClientIp(ctx: any): string {
  const h = ctx?.request?.headers
  const first = (v?: string | null) => v?.split(',')[0]?.trim()
  return (
    first(h?.get('cf-connecting-ip')) ||
    first(h?.get('x-vercel-forwarded-for')) ||
    first(h?.get('x-real-ip')) ||
    first(h?.get('x-forwarded-for')) ||
    (ctx as any)?.clientAddress ||
    'unknown'
  )
}

// Valida el formato del cupón XXXX-XXXX-XXXX
function validateCouponFormat(coupon: string): boolean {
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return pattern.test(coupon)
}

// Normaliza el cupón a mayúsculas y elimina caracteres no válidos
function normalizeCoupon(coupon: string): string {
  return coupon
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '') // Solo letras, números y guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
}

export const server = {
  sendMagicLink: defineAction({
    input: z.object({
      email: emailSchema,
    }),
    async handler({ email }, ctx) {
      const ip = getClientIp(ctx)

      // Rate limiting estricto para magic links
      const [byEmail, byIp] = await Promise.all([
        RateLimitPresets.expensive(email),
        RateLimitPresets.antiSpam(ip),
      ])

      const failed =
        (!byEmail.success && { kind: 'email', res: byEmail }) ||
        (!byIp.success && { kind: 'ip', res: byIp }) ||
        null

      if (failed) {
        console.warn('[RATE_LIMIT_BLOCK_MAGIC_LINK]', {
          bucket: failed.kind,
          reset: failed.res.reset,
          ip,
        })

        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: getRateLimitMessage(failed.res.reset),
        })
      }

      try {
        const supabase = createClient({ request: ctx.request, cookies: ctx.cookies })

        // Enviar el magic link usando Supabase Auth
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${ctx.url.origin}/api/auth/callback`,
          },
        })

        if (error) {
          console.error('[MAGIC_LINK_ERROR]', {
            ip,
            error: error.message,
          })

          // No revelar si el email existe o no por seguridad
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error al enviar el enlace mágico. Inténtalo de nuevo más tarde.',
          })
        }

        return {
          success: true,
          message: '¡Revisa tu email! Te hemos enviado un enlace para iniciar sesión',
        }
      } catch (error) {
        if (error instanceof ActionError) {
          throw error
        }

        console.error('[MAGIC_LINK_UNEXPECTED_ERROR]', {
          ip,
          error,
        })

        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error inesperado al procesar la solicitud',
        })
      }
    },
  }),

  validateCoupon: defineAction({
    input: z.object({
      coupon: z
        .string({
          required_error: 'El código del cupón es requerido',
          invalid_type_error: 'El código del cupón debe ser un texto',
        })
        .trim()
        .min(1, 'El código del cupón no puede estar vacío')
        .max(15, 'El código del cupón es demasiado largo'),
    }),
    async handler({ coupon }, ctx) {
      const user = ctx.locals.user

      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión para validar cupones',
        })
      }

      const ip = getClientIp(ctx)

      // Rate limiting para validación de cupones (por IP y por usuario)
      const [byIp, byUser] = await Promise.all([
        RateLimitPresets.ip(ip),
        RateLimitPresets.antiSpam(user.id),
      ])

      const failed =
        (!byIp.success && { kind: 'ip', res: byIp }) ||
        (!byUser.success && { kind: 'user', res: byUser }) ||
        null

      if (failed) {
        console.warn('[RATE_LIMIT_BLOCK_COUPON]', {
          bucket: failed.kind,
          reset: failed.res.reset,
          ip,
          userId: user.id,
        })

        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: getRateLimitMessage(failed.res.reset),
        })
      }

      // Normalizar y validar formato del cupón
      const normalizedCoupon = normalizeCoupon(coupon)

      if (!validateCouponFormat(normalizedCoupon)) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'El formato del cupón debe ser XXXX-XXXX-XXXX (solo letras y números)',
        })
      }

      try {
        const couponHash = hash(normalizedCoupon)

        // Verificar primero si el cupón existe y su estado
        const { data: existingCoupon, error: checkError } = await supabaseAdmin
          .from('coupons')
          .select('id, is_used, is_reactivable, hash, used_by')
          .eq('hash', couponHash)
          .single()

        if (checkError || !existingCoupon) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Este cupón no es válido',
          })
        }

        // Si el cupón está usado y NO es reactivable, rechazar
        if (existingCoupon.is_used && !existingCoupon.is_reactivable) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Este cupón ya ha sido utilizado previamente',
          })
        }

        let couponData

        // Si el cupón es reactivable, crear un nuevo registro duplicado
        if (existingCoupon.is_used && existingCoupon.is_reactivable) {
          // Validar que el usuario que intenta reutilizar no sea el mismo que lo usó
          if (existingCoupon.used_by === user.id) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Ya has usado este cupón en tu cuenta anteriormente',
            })
          }

          // Verificar que no exista ya un duplicado
          const duplicateHash = `${existingCoupon.hash}_1`
          const { data: existingDuplicate } = await supabaseAdmin
            .from('coupons')
            .select('id')
            .eq('hash', duplicateHash)
            .single()

          if (existingDuplicate) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Este cupón ya ha sido reutilizado el máximo de veces permitidas',
            })
          }

          // Crear nuevo registro duplicado y actualizar el original
          const [insertResult, updateResult] = await Promise.all([
            supabaseAdmin
              .from('coupons')
              .insert({
                hash: `${existingCoupon.hash}_1`,
                original_hash: existingCoupon.hash,
                is_used: true,
                used_at: new Date().toISOString(),
                used_by: user.id,
                used_ip: ip,
                is_reactivable: false,
              })
              .select('id')
              .single(),
            // Actualizar el cupón original para que no pueda ser reutilizado de nuevo
            supabaseAdmin
              .from('coupons')
              .update({ is_reactivable: false })
              .eq('id', existingCoupon.id),
          ])

          const { data: newCoupon, error: insertError } = insertResult
          const { error: updateError } = updateResult

          if (insertError || !newCoupon) {
            console.error('[COUPON_DUPLICATE_ERROR]', {
              ip,
              coupon: normalizedCoupon,
              error: insertError,
            })
            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Error al procesar el cupón',
            })
          }

          if (updateError) {
            console.error('[COUPON_REACTIVABLE_UPDATE_ERROR]', {
              ip,
              coupon: normalizedCoupon,
              error: updateError,
            })
            // No lanzamos error aquí porque el cupón duplicado ya se creó exitosamente
          }

          couponData = newCoupon
        } else {
          // Uso normal: actualizar el cupón existente
          const { data: updatedCoupon, error: updateError } = await supabaseAdmin
          .from('coupons')
          .update({
            is_used: true,
            used_at: new Date().toISOString(),
            used_by: user.id,
            used_ip: ip,
          })
          .eq('id', existingCoupon.id)
          .select('id')
          .single()

          if (updateError || !updatedCoupon) {
            console.error('[COUPON_UPDATE_ERROR]', {
              ip,
              coupon: normalizedCoupon,
              error: updateError,
            })

            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Error al verificar el cupón',
            })
          }

          couponData = updatedCoupon
        }

        // Obtener el número total de cupones validados por este usuario
        const { data: userCoupons, error: countError } = await supabaseAdmin
          .from('coupons')
          .select('id')
          .eq('used_by', user.id)
          .eq('is_used', true)

        if (countError) {
          console.error('[COUPON_COUNT_ERROR]', {
            userId: user.id,
            error: countError,
          })
        }

        const totalCoupons = userCoupons?.length ?? 1

        // Grant achievement based on total coupons redeemed
        const achievementId = totalCoupons === 1 ? 'calendar-redeemed'
          : totalCoupons === 2 ? 'calendar-two' 
          : totalCoupons === 5 ? 'calendar-lover' 
          : undefined

        let achievementResult

        if (achievementId) {
          achievementResult = await grantAchievement(user.id, achievementId)
        }

        return {
          success: true,
          message: '¡Cupón validado correctamente!',
          totalCoupons,
          achievement: achievementResult?.success && achievementResult?.new ? achievementResult.achievement : undefined,
        }
      } catch (error) {
        if (error instanceof ActionError) {
          throw error
        }

        console.error('[COUPON_VALIDATION_ERROR]', {
          ip,
          coupon: normalizedCoupon,
          error,
        })

        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error interno al validar el cupón',
        })
      }
    },
  }),

  grantClickerAchievement: defineAction({
    input: z.object({
      achievementId: z.string().optional().default('clicker-level-1'),
    }),
    async handler({ achievementId }, ctx) {
      const user = ctx.locals.user
      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión',
        })
      }

      const result = await grantAchievement(user.id, achievementId)
      if (!result.success) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al guardar el logro',
        })
      }

      return { 
        success: true, 
        new: result.new,
        achievement: result.new && result.achievement ? result.achievement : undefined,
      }
    },
  }),

  grantGameAchievement: defineAction({
    input: z.object({
      achievementId: z.string(),
    }),
    async handler({ achievementId }, ctx) {
      const user = ctx.locals.user
      if (!user) {
        throw new ActionError({
          code: 'UNAUTHORIZED',
          message: 'Debes iniciar sesión',
        })
      }

      const result = await grantAchievement(user.id, achievementId)
      if (!result.success) {
        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error al guardar el logro',
        })
      }

      return { 
        success: true, 
        new: result.new,
        achievement: result.new && result.achievement ? result.achievement : undefined,
      }
    },
  }),
}
