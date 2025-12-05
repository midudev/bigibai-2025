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
    const { duplicateCouponId } = body

    if (!duplicateCouponId) {
      return new Response(JSON.stringify({ error: 'duplicateCouponId es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Obtener el cupón duplicado para recuperar el original_hash
    const { data: duplicateCoupon, error: fetchError } = await supabaseAdmin
      .from('coupons')
      .select('id, hash, original_hash')
      .eq('id', duplicateCouponId)
      .single()

    if (fetchError || !duplicateCoupon) {
      console.error('Error al buscar cupón duplicado:', fetchError)
      return new Response(JSON.stringify({ error: 'Cupón duplicado no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verificar que tiene original_hash (es un duplicado real)
    if (!duplicateCoupon.original_hash) {
      return new Response(
        JSON.stringify({ error: 'Este cupón no es un duplicado (no tiene original_hash)' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Buscar el cupón original usando original_hash
    const { data: originalCoupon, error: originalFetchError } = await supabaseAdmin
      .from('coupons')
      .select('id, hash')
      .eq('hash', duplicateCoupon.original_hash)
      .single()

    if (originalFetchError || !originalCoupon) {
      console.error('Error al buscar cupón original:', originalFetchError)
      return new Response(JSON.stringify({ error: 'Cupón original no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Eliminar el cupón duplicado
    const { error: deleteError } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', duplicateCouponId)

    if (deleteError) {
      console.error('Error al eliminar cupón duplicado:', deleteError)
      return new Response(JSON.stringify({ error: 'Error al eliminar el cupón duplicado' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Actualizar el cupón original para que sea reactivable de nuevo
    const { error: updateError } = await supabaseAdmin
      .from('coupons')
      .update({ is_reactivable: true })
      .eq('id', originalCoupon.id)

    if (updateError) {
      console.error('Error al actualizar cupón original:', updateError)
      return new Response(
        JSON.stringify({
          error: 'El cupón duplicado fue eliminado pero hubo un error al reactivar el original',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cupón duplicado eliminado y original reactivado correctamente',
        deletedCouponId: duplicateCouponId,
        reactivatedCouponId: originalCoupon.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error al eliminar cupón duplicado:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
