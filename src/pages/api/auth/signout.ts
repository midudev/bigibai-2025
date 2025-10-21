import { createClient } from '@/supabase'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createClient({ request, cookies })

  const { error } = await supabase.auth.signOut()
  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return redirect('/')
}
