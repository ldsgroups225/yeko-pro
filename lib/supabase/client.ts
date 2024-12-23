import type { Database } from '@/lib/supabase/types'
// import { getEnvOrThrow } from '@/lib/utils/Env'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // const env = getEnvOrThrow()

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
