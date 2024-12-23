import type { Database } from '@/lib/supabase/types'
import { getEnvOrThrow } from '@/lib/utils/Env'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const env = getEnvOrThrow()
  // const cookieStore = cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: async () => {
          const cookieStore = cookies()
          return (await cookieStore).getAll()
        },
        setAll: async (cookiesToSet) => {
          try {
            const cookieStore = cookies()
            cookiesToSet.forEach(({ name, value, options }) => {
              (cookieStore as any).set(name, value, options)
            })
          }
          catch (error) {
            // Handle error if necessary. Don't just silently ignore.
            console.error('Error setting cookies:', error)
          }
        },
      },
    },
  )
}
