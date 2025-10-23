import type { APIRoute } from 'astro'
import { supabaseAdmin } from '@/supabase-admin'
import { isAdmin } from '@/utils/admin'

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

  // Obtener el email del usuario de la query
  const url = new URL(request.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Buscar el usuario ID por email usando la función RPC
    const { data: userId, error: rpcError } = await supabaseAdmin.rpc('get_user_id_by_email', {
      p_email: email,
    })

    if (rpcError) {
      console.error('Error al buscar usuario por email:', rpcError)
      return new Response(JSON.stringify({ error: 'Error al buscar usuario' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Obtener los detalles completos del usuario
    const { data: userResponse, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(userId)

    if (userError || !userResponse.user) {
      console.error('Error al obtener detalles del usuario:', userError)
      return new Response(JSON.stringify({ error: 'Error al obtener detalles del usuario' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const user = userResponse.user

    // Obtener los cupones del usuario
    const { data: coupons, error: couponsError } = await supabaseAdmin
      .from('coupons')
      .select('id, hash, used_at')
      .eq('used_by', user.id)
      .eq('is_used', true)
      .order('used_at', { ascending: false })

    if (couponsError) {
      console.error('Error al obtener cupones:', couponsError)
    }

    // Preparar la respuesta con la información del usuario
    const userData = {
      id: user.id,
      email: user.email,
      name:
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.display_name ||
        null,
      provider: user.app_metadata?.provider || null,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      coupons: coupons || [],
    }

    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error al buscar usuario:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
