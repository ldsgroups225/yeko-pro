import type { Database } from '@/lib/supabase/types'
import { getEnvOrThrowClientSide } from '@/lib/utils/EnvClient'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const env = getEnvOrThrowClientSide()

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
