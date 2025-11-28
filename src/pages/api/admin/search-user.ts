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

  // Obtener el parámetro de búsqueda (email o ID)
  const url = new URL(request.url)
  const query = url.searchParams.get('query')

  if (!query) {
    return new Response(JSON.stringify({ error: 'Email o ID no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    let userId: string | null = null

    // Detectar si es un UUID (ID de usuario) o un email
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isUUID = uuidRegex.test(query)

    if (isUUID) {
      // Si es un UUID, usarlo directamente
      userId = query
    } else {
      // Si no es UUID, asumir que es un email y buscar el usuario
      const { data: foundUserId, error: rpcError } = await supabaseAdmin.rpc(
        'get_user_id_by_email',
        {
          p_email: query,
        }
      )

      if (rpcError) {
        console.error('Error al buscar usuario por email:', rpcError)
        return new Response(JSON.stringify({ error: 'Error al buscar usuario' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      userId = foundUserId
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

    // Obtener los logros del usuario
    const { data: userAchievements, error: achievementsError } = await supabaseAdmin
      .from('user_achievements')
      .select('achievements')
      .eq('user_id', user.id)
      .single()

    if (achievementsError && achievementsError.code !== 'PGRST116') {
      console.error('Error al obtener logros:', achievementsError)
    }

    // Preparar la respuesta con la información del usuario
    const metadata = user.user_metadata ?? {}
    const userData = {
      id: user.id,
      email: user.email,
      name:
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        (metadata.first_name && metadata.last_name
          ? `${metadata.first_name} ${metadata.last_name}`
          : null) ||
        metadata.first_name ||
        metadata.last_name ||
        null,
      provider: user.app_metadata?.provider || null,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      coupons: coupons || [],
      achievements: userAchievements?.achievements || {},
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
