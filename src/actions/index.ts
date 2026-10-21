import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/services/ratelimit'
import { ActionError, defineAction, type ActionAPIContext } from 'astro:actions'
import { z } from 'astro:schema'
import { supabaseAdmin } from '@/supabase-admin'
import { createClient } from '@/supabase'
import { hashCoupon } from '@/utils/crypto'
import { emailSchema } from '@/validations/email'
import { grantAchievement } from '@/utils/achievements'
import { isAdmin } from '@/utils/admin'
import { getCampaignPhase, isDayUnlocked, isExperienceEnabled } from '@/utils/campaign'
import { CAMPAIGN } from '@/data/campaign'
import { GAME_ACHIEVEMENTS } from '@/data/achievements'
import { cells, type GameType } from '@/data/days-data'

// IP real del cliente. Cloudflare sobrescribe `cf-connecting-ip` en cada petición; x-forwarded-for
// y x-real-ip los puede mandar cualquiera y servirían para saltarse el rate limit por IP
function getClientIp(ctx: ActionAPIContext): string {
  return ctx.request.headers.get('cf-connecting-ip') || ctx.clientAddress || 'unknown'
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

// Las mismas condiciones que la página de la casilla para mostrar el juego: la experiencia está
// activa, alguna casilla con ese juego ya se ha abierto y el usuario ha validado algún calendario
async function canPlayGame(userId: string, gameTypes: GameType[], now: Date): Promise<boolean> {
  if (!isExperienceEnabled(now)) return false

  const isGameUnlocked = cells.some(
    ({ day, gameType }) => gameTypes.includes(gameType) && isDayUnlocked(day, now)
  )
  if (!isGameUnlocked) return false

  const { count } = await supabaseAdmin
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('used_by', userId)
    .eq('is_used', true)

  return (count ?? 0) > 0
}

export const server = {
  sendMagicLink: defineAction({
    input: z.object({
      email: emailSchema,
    }),
    async handler({ email }, ctx) {
      if (!CAMPAIGN.signInEnabled) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'El acceso está desactivado temporalmente',
        })
      }

      const ip = getClientIp(ctx)

      // Rate limiting estricto para magic links
      const [byEmail, byIp] = await Promise.all([
        checkRateLimit('magicLinkEmail', email),
        checkRateLimit('magicLinkIp', ip),
      ])

      const failed = (!byEmail && 'email') || (!byIp && 'ip') || null

      if (failed) {
        console.warn('[RATE_LIMIT_BLOCK_MAGIC_LINK]', { bucket: failed, ip })

        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: RATE_LIMIT_MESSAGE,
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
      // El periodo de registro lo marca la configuración de la campaña (src/data/campaign.ts)
      const phase = getCampaignPhase(ctx.locals.now)

      if (phase !== 'registration') {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message:
            phase === 'upcoming'
              ? 'El registro de calendarios todavía no está abierto'
              : 'El plazo para validar cupones ha finalizado',
        })
      }

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
        checkRateLimit('couponIp', ip),
        checkRateLimit('couponUser', user.id),
      ])

      const failed = (!byIp && 'ip') || (!byUser && 'user') || null

      if (failed) {
        console.warn('[RATE_LIMIT_BLOCK_COUPON]', { bucket: failed, ip, userId: user.id })

        throw new ActionError({
          code: 'TOO_MANY_REQUESTS',
          message: RATE_LIMIT_MESSAGE,
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
        const couponHash = hashCoupon(normalizedCoupon)

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
              couponId: existingCoupon.id,
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
              couponId: existingCoupon.id,
              error: updateError,
            })
            // No lanzamos error aquí porque el cupón duplicado ya se creó exitosamente
          }

          couponData = newCoupon
        } else {
          // Uso normal: actualizar el cupón existente
          // El filtro is_used = false hace el canje atómico: si dos peticiones llegan a la vez,
          // solo una actualiza la fila
          const { data: updatedCoupon, error: updateError } = await supabaseAdmin
          .from('coupons')
          .update({
            is_used: true,
            used_at: new Date().toISOString(),
            used_by: user.id,
            used_ip: ip,
          })
          .eq('id', existingCoupon.id)
          .eq('is_used', false)
          .select('id')
          .maybeSingle()

          if (updateError) {
            console.error('[COUPON_UPDATE_ERROR]', {
              ip,
              couponId: existingCoupon.id,
              error: updateError,
            })

            throw new ActionError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Error al verificar el cupón',
            })
          }

          // Otra petición lo canjeó entre la comprobación y la actualización
          if (!updatedCoupon) {
            throw new ActionError({
              code: 'BAD_REQUEST',
              message: 'Este cupón ya ha sido utilizado previamente',
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
          userId: user.id,
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
      achievementId: z.enum(['clicker-level-1', 'clicker-level-5']).optional().default('clicker-level-1'),
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

      // Solo los logros de los juegos de las casillas, y únicamente si el usuario puede jugarlos
      // hasOwn: con `constructor` o `__proto__` la búsqueda normal devolvería algo de Object
      const gameTypes = Object.hasOwn(GAME_ACHIEVEMENTS, achievementId)
        ? GAME_ACHIEVEMENTS[achievementId]
        : undefined
      if (!gameTypes) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'Este logro no se consigue en un juego',
        })
      }

      if (!isAdmin(user.id) && !(await canPlayGame(user.id, gameTypes, ctx.locals.now))) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'Este juego todavía no está disponible',
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
