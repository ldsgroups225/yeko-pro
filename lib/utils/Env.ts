import { z } from 'zod'

/**
 * Schema for environment variables.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string({
    required_error: 'Please put your SUPABASE_URL to the environment',
  })
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .min(1, 'SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string({
    required_error: 'Please put your SUPABASE_ANON_KEY to the environment',
  })
    .min(1, 'SUPABASE_ANON_KEY is required'),
})

/** Type definition for the environment variables. */
type Env = z.infer<typeof envSchema>

/**
 * Retrieves and validates environment variables.
 * @throws {Error} If environment variables are invalid or missing.
 * @returns The validated environment variables.
 */
export function getEnvOrThrow(): Env {
  const { NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL } = process.env

  const result = envSchema.safeParse({ NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY })

  if (!result.success) {
    const errorMessages = result.error.errors.map(err => err.message).join(', ')
    throw new Error(`Invalid environment variables: ${errorMessages}`)
  }

  return result.data
}

// Usage:
// const env = getEnvOrThrow()
// console.log(env.NEXT_PUBLIC_SUPABASE_URL)
