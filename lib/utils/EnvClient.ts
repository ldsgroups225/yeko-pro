/** @type {ClientEnv} */
interface ClientEnv {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_SITE_URL: string
}

/**
 * Retrieves client-side environment variables with type safety.
 * @returns {ClientEnv} Validated client-side environment configuration
 * @throws {Error} If any required environment variable is missing
 *
 * @example
 * // Usage in client-side code:
 * const env = getEnvOrThrowClientSide();
 * console.log(env.NEXT_PUBLIC_SUPABASE_URL);
 */
export function getEnvOrThrowClientSide(): ClientEnv {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  }

  const missingVariables = Object.entries(env)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(', ')}`,
    )
  }

  // Type assertion is safe here because we've validated presence of all properties
  return env as ClientEnv
}
