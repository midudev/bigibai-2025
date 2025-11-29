import type { APIRoute } from 'astro'
import { supabaseAdmin } from '@/supabase-admin'
import { isAdmin } from '@/utils/admin'

export const POST: APIRoute = async ({ request, locals }) => {
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

  try {
    const body = await request.json()
    const { couponId } = body

    if (!couponId) {
      return new Response(JSON.stringify({ error: 'couponId es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verificar que el cupón existe
    const { data: coupon, error: fetchError } = await supabaseAdmin
      .from('coupons')
      .select('id, is_used, used_by, used_at')
      .eq('id', couponId)
      .single()

    if (fetchError || !coupon) {
      console.error('Error al buscar cupón:', fetchError)
      return new Response(JSON.stringify({ error: 'Cupón no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Resetear el cupón: poner is_used a false, used_at a null, used_by a null, 
    // used_ip a null, is_reactivable a false y original_hash a null
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update({
        is_used: false,
        used_at: null,
        used_by: null,
        used_ip: null,
        is_reactivable: false,
        original_hash: null,
      })
      .eq('id', couponId)
      .select('id')
      .single()

    if (error) {
      console.error('Error al resetear cupón:', error)
      return new Response(JSON.stringify({ error: 'Error al resetear el cupón' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!data) {
      return new Response(JSON.stringify({ error: 'Cupón no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cupón reseteado correctamente',
        coupon: data,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error al resetear cupón:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
