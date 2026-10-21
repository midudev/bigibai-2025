import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, SUPABASE_ADMIN_KEY } from 'astro:env/server'

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, SUPABASE_ADMIN_KEY)
