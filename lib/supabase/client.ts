import type { Database } from '@/lib/supabase/types'
import { createBrowserClient } from '@supabase/ssr'
import { getEnvOrThrowClientSide } from '@/lib/utils/EnvClient'

export function createClient() {
  const env = getEnvOrThrowClientSide()

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}

export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>
