import { createSupabaseClient } from '@/supabase'
import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  cookies.delete('access-token', { path: '/' })
  cookies.delete('refresh-token', { path: '/' })

  const supabase = createSupabaseClient()
  // sign out from supabase
  const { error } = await supabase.auth.signOut()
  if (error) {
    return new Response(error.message, { status: 500 })
  }

  return redirect('/')
}
