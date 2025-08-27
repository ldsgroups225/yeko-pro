'use server'

import type {
  GoogleProfile,
  OAuthOptions,
  OAuthResult,
} from '@/types'
import { createClient } from '@/lib/supabase/server'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'
import { ERole } from '@/types'

/**
 * Initiates Google OAuth sign-in flow
 *
 * @param options - OAuth configuration options
 * @returns Promise with authentication URL or error
 */
export async function signInWithGoogle(options: Partial<OAuthOptions> = {}): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    const env = getEnvOrThrowServerSide()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: options.redirectTo || `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        scopes: options.scopes?.join(' ') || 'email profile',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  }
  catch (error) {
    console.error('Error in signInWithGoogle:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite',
    }
  }
}

/**
 * Initiates Google OAuth sign-up flow
 *
 * @param options - OAuth configuration options
 * @returns Promise with authentication URL or error
 */
export async function signUpWithGoogle(options: Partial<OAuthOptions> = {}): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  // For Google OAuth, sign-in and sign-up are essentially the same flow
  // The distinction is made after the user returns from Google
  return signInWithGoogle(options)
}

/**
 * Processes the OAuth callback and handles user creation/authentication
 *
 * @param code - Authorization code from OAuth provider
 * @param _state - OAuth state parameter
 * @returns Promise with OAuth result
 */
export async function handleOAuthCallback(
  code: string,
  _state?: string,
): Promise<OAuthResult> {
  try {
    const supabase = await createClient()

    // Exchange code for session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return { success: false, error: error.message }
    }

    if (!session?.user) {
      return { success: false, error: 'Session invalide' }
    }

    const user = session.user
    const isNewUser = !user.email_confirmed_at

    // Check if user already exists in our database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', user.id)
      .single()

    // If new user, create profile
    if (!existingUser && user.user_metadata) {
      await createUserFromGoogleProfile(user.id, user.user_metadata as GoogleProfile)
    }

    // Fetch complete user profile
    const { fetchUserProfile } = await import('./userService')
    const userProfile = await fetchUserProfile()

    return {
      success: true,
      user: userProfile,
      isNewUser,
    }
  }
  catch (error) {
    console.error('Error in handleOAuthCallback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors du traitement de l\'authentification',
    }
  }
}

/**
 * Creates a new user profile from Google OAuth data
 *
 * @param userId - Supabase user ID
 * @param googleProfile - Google profile data
 * @returns Promise with creation result
 */
export async function createUserFromGoogleProfile(
  userId: string,
  googleProfile: GoogleProfile,
): Promise<{ success: boolean, error?: string }> {
  try {
    const supabase = await createClient()

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: googleProfile.email,
        first_name: googleProfile.given_name || googleProfile.name.split(' ')[0],
        last_name: googleProfile.family_name || googleProfile.name.split(' ').slice(1).join(' '),
        avatar_url: googleProfile.picture,
        email_verified: googleProfile.email_verified,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      throw new Error(`Erreur lors de la création du profil: ${profileError.message}`)
    }

    // Assign default role (PARENT) to new OAuth users
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: ERole.PARENT,
        created_at: new Date().toISOString(),
      })

    if (roleError) {
      console.warn('Failed to assign default role:', roleError)
      // Don't fail the entire operation if role assignment fails
    }

    return { success: true }
  }
  catch (error) {
    console.error('Error in createUserFromGoogleProfile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la création du profil utilisateur',
    }
  }
}

/**
 * Links a Google account to an existing user
 *
 * @param userId - Current user ID
 * @returns Promise with linking result
 */
export async function linkGoogleAccount(userId: string): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  try {
    const env = getEnvOrThrowServerSide()
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user || user.id !== userId) {
      return { success: false, error: 'Utilisateur non autorisé' }
    }

    // Initiate linking process
    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?linking=true`,
        scopes: 'email profile',
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  }
  catch (error) {
    console.error('Error in linkGoogleAccount:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la liaison du compte',
    }
  }
}

/**
 * Unlinks a Google account from the current user
 *
 * @param userId - Current user ID
 * @returns Promise with unlinking result
 */
export async function unlinkGoogleAccount(userId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user || user.id !== userId) {
      return { success: false, error: 'Utilisateur non autorisé' }
    }

    // Find Google identity
    const identities = user.identities?.find(identity => identity.provider === 'google')

    if (!identities) {
      return { success: false, error: 'Aucun compte Google lié' }
    }

    // Unlink identity
    const { error } = await supabase.auth.unlinkIdentity(identities)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }
  catch (error) {
    console.error('Error in unlinkGoogleAccount:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la liaison',
    }
  }
}

/**
 * Checks if a user has a Google account linked
 *
 * @param userId - User ID to check
 * @returns Promise with boolean result
 */
export async function hasGoogleAccountLinked(userId?: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user || (userId && user.id !== userId)) {
      return false
    }

    return user.identities?.some(identity => identity.provider === 'google') ?? false
  }
  catch (error) {
    console.error('Error in hasGoogleAccountLinked:', error)
    return false
  }
}

/**
 * Gets Google profile information for the current user
 *
 * @returns Promise with Google profile data or null
 */
export async function getGoogleProfile(): Promise<GoogleProfile | null> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const googleIdentity = user.identities?.find(identity => identity.provider === 'google')

    if (!googleIdentity) {
      return null
    }

    return googleIdentity.identity_data as GoogleProfile
  }
  catch (error) {
    console.error('Error in getGoogleProfile:', error)
    return null
  }
}
