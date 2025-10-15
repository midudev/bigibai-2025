import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabaseAdminKey = import.meta.env.SUPABASE_ADMIN_KEY

// Cliente para el servidor (sin persistencia de sesión)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente para el cliente (con persistencia de sesión)
export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey)