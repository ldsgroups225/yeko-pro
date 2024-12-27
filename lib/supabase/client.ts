import type { Database } from '@/lib/supabase/types'
import { getEnvOrThrow } from '@/lib/utils/Env'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const env = getEnvOrThrow()

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
