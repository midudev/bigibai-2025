import type { APIRoute } from 'astro'
import { supabaseAdmin } from '@/supabase-admin'
import { isAdmin } from '@/utils/admin'
import { hash } from '@/utils/crypto'

export const GET: APIRoute = async ({ request, locals }) => {
  // Verificar autenticación
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'No autenticado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Verificar que sea admin
  if (!isAdmin(locals.user.id)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Obtener el hash del cupón de la query
  const url = new URL(request.url)
  const couponCode = url.searchParams.get('coupon')

  if (!couponCode) {
    return new Response(JSON.stringify({ error: 'Cupón no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Buscar el cupón por hash
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from('coupons')
      .select('id, hash, is_used, used_at, used_by')
      .eq('hash', hash(couponCode))
      .single()

    if (couponError || !coupon) {
      return new Response(JSON.stringify({ error: 'Cupón no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Si el cupón no ha sido usado, devolver solo la info básica
    if (!coupon.is_used) {
      return new Response(
        JSON.stringify({
          id: coupon.id,
          hash: coupon.hash,
          is_used: false,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Si el cupón ha sido usado, obtener información del usuario
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      coupon.used_by
    )

    const userData = {
      user_email: user?.user?.email || null,
      user_name:
        user?.user?.user_metadata?.full_name ||
        user?.user?.user_metadata?.name ||
        user?.user?.user_metadata?.display_name ||
        null,
    }

    return new Response(
      JSON.stringify({
        id: coupon.id,
        hash: coupon.hash,
        is_used: true,
        used_at: coupon.used_at,
        used_by: coupon.used_by,
        ...userData,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error al validar cupón:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
