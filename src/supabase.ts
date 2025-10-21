import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY

// Cliente para el cliente (con persistencia de sesión y PKCE)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    flowType: "pkce"
  },
})
