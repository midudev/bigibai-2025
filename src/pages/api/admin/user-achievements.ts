import type { APIRoute } from 'astro'
import { supabaseAdmin } from '@/supabase-admin'
import { isAdmin } from '@/utils/admin'
import { ACHIEVEMENTS } from '@/data/achievements'

// GET: Obtener logros de un usuario
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

  // Obtener el userId de los parámetros
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId no proporcionado' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Obtener logros del usuario
    const { data: userAchievements, error } = await supabaseAdmin
      .from('user_achievements')
      .select('achievements')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 es "no rows returned"
      console.error('Error al obtener logros:', error)
      return new Response(JSON.stringify({ error: 'Error al obtener logros' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const achievements = userAchievements?.achievements || {}

    // Preparar respuesta con todos los logros y su estado
    const allAchievements = Object.values(ACHIEVEMENTS).map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      descriptionDo: achievement.descriptionDo,
      descriptionDone: achievement.descriptionDone,
      image: achievement.image,
      unlocked: !!achievements[achievement.id],
      unlockedAt: achievements[achievement.id]?.created_at || null,
    }))

    return new Response(JSON.stringify({ achievements: allAchievements }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error al obtener logros:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// POST: Actualizar logros de un usuario (activar/desactivar)
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
    const { userId, achievementId, action } = body

    if (!userId || !achievementId || !action) {
      return new Response(
        JSON.stringify({ error: 'userId, achievementId y action son requeridos' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (!ACHIEVEMENTS[achievementId]) {
      return new Response(JSON.stringify({ error: 'Logro no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (action !== 'activate' && action !== 'deactivate') {
      return new Response(JSON.stringify({ error: 'action debe ser "activate" o "deactivate"' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Obtener logros actuales del usuario
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from('user_achievements')
      .select('achievements')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error al obtener logros:', fetchError)
      return new Response(JSON.stringify({ error: 'Error al obtener logros' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    let currentAchievements = existingData?.achievements || {}

    if (action === 'activate') {
      // Activar logro
      if (!currentAchievements[achievementId]) {
        currentAchievements[achievementId] = {
          created_at: new Date().toISOString(),
        }
      }
    } else {
      // Desactivar logro
      delete currentAchievements[achievementId]
    }

    // Actualizar en la base de datos
    const { error: upsertError } = await supabaseAdmin.from('user_achievements').upsert({
      user_id: userId,
      achievements: currentAchievements,
    })

    if (upsertError) {
      console.error('Error al actualizar logros:', upsertError)
      return new Response(JSON.stringify({ error: 'Error al actualizar logros' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Logro ${action === 'activate' ? 'activado' : 'desactivado'} correctamente`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error al actualizar logros:', error)
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
