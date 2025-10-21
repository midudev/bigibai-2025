import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAdminKey = import.meta.env.SUPABASE_ADMIN_KEY

export const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey)
