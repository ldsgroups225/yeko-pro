// lib/supabase/server.ts

import type { CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/supabase/types'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'

export async function createClient() {
  const env = getEnvOrThrowServerSide()
  const cookieStore = await cookies()

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          }
          catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            // You might want to log this error for debugging purposes
            // console.error('Error setting cookies in Server Component:', error);
          }
        },
      },
    },
  )
}

// Keep SupabaseClient type export if needed elsewhere
export type SupabaseClient = ReturnType<typeof createServerClient<Database>>
