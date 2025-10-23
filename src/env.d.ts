/// <reference types="astro/client" />

import type { User } from '@supabase/supabase-js'

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace App {
    interface Locals {
      user: null | User
    }
  }

  interface Window {
    L: any
  }
}
