'use server'

import type { IUserProfileDTO } from '@/types'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'
import { ERole } from '@/types'

/**
 * Gets the current authenticated user's basic information.
 *
 * @returns {Promise<string | null>} The current user ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return user?.id ?? null
}

/**
 * Fetches the complete user profile including role information for any user type.
 * Now supports directors, teachers, and parents with role-based data loading.
 *
 * @returns {Promise<IUserProfileDTO>} The user's complete profile
 * @throws {Error} With message 'Unauthorized' if user is not authenticated
 * @throws {Error} With message 'Profile not found' if profile fetch fails
 */
export async function fetchUserProfile(): Promise<IUserProfileDTO> {
  try {
    const supabase = await createClient()
    const userId = await getUserId()

    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Get user basic profile and ALL roles (removed DIRECTOR restriction)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        school_id,
        avatar_url,
        user_roles(role_id)
      `)
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error('Profile not found')
    }

    // Get user roles using the authorization service
    const { getUserRoles, getRoleDisplayName } = await import('./authorizationService')
    const roleInfo = await getUserRoles(userId)

    // Determine primary role and role string
    const primaryRole = roleInfo.primaryRole || ERole.PARENT // Default fallback
    const roleString = await getRoleDisplayName(primaryRole)

    // Build base user profile
    const baseProfile: IUserProfileDTO = {
      id: userId,
      email: profile.email!,
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      fullName: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim(),
      phoneNumber: profile.phone ?? '',
      role: roleString,
      avatarUrl: profile.avatar_url || null,
      school: {
        id: '',
        name: '',
        code: '',
        city: '',
        phone: '',
        email: '',
        address: '',
        cycleId: '',
        imageUrl: '',
        classCount: 0,
        studentCount: 0,
        createdAt: '',
        createdBy: '',
        updatedAt: '',
        updatedBy: '',
      },
    }

    // Load role-specific data (only for directors with school access)
    const hasDirectorAccess = roleInfo.hasDirectorAccess
    const hasCashierAccess = roleInfo.hasCashierAccess
    const hasAccountantAccess = roleInfo.hasAccountantAccess
    const hasEducatorAccess = roleInfo.hasEducatorAccess
    const hasHeadmasterAccess = roleInfo.hasHeadmasterAccess

    const hasAccess = hasDirectorAccess || hasCashierAccess || hasAccountantAccess || hasEducatorAccess || hasHeadmasterAccess

    if (hasAccess && profile.school_id) {
      try {
        const [schoolResult, studentCountResult] = await Promise.all([
          supabase.from('schools')
            .select('*, classes(count)')
            .eq('id', profile.school_id)
            .single(),
          supabase.from('student_school_class')
            .select('*', { count: 'estimated' })
            .eq('school_id', profile.school_id)
            .eq('enrollment_status', 'accepted')
            .is('is_active', true),
        ])

        if (schoolResult.data) {
          baseProfile.school = {
            id: schoolResult.data.id,
            name: schoolResult.data.name,
            code: schoolResult.data.code,
            city: schoolResult.data.city ?? '',
            phone: schoolResult.data.phone ?? '',
            email: schoolResult.data.email ?? '',
            address: schoolResult.data.address ?? '',
            cycleId: schoolResult.data.cycle_id,
            imageUrl: schoolResult.data.image_url ?? '',
            classCount: (schoolResult.data.classes[0] as any)?.count ?? 0,
            studentCount: studentCountResult.count ?? 0,
            createdAt: schoolResult.data.created_at ?? '',
            createdBy: schoolResult.data.created_by ?? '',
            updatedAt: schoolResult.data.updated_at ?? '',
            updatedBy: schoolResult.data.updated_by ?? '',
          }
        }
      }
      catch (error) {
        // Non-critical error - user profile still works without school data
        console.warn('Failed to load school data:', error)
      }
    }

    return baseProfile
  }
  catch (error) {
    // Re-throw known errors with their original messages
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Profile not found')) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected error in fetchUserProfile:', error)
    throw new Error('Failed to fetch user profile')
  }
}

/**
 * Signs up a new user with full name, email and password
 *
 * @param fullName - User's full name
 * @param email - User's email address
 * @param password - User's password
 * @returns Object containing success status and any error message
 */
export async function signUp(fullName: string, email: string, password: string) {
  const env = getEnvOrThrowServerSide()
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    message: 'Veuillez vérifier votre boîte mail pour confirmer votre compte',
  }
}

/**
 * Signs in an existing user with email and password
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Object containing success status and any error message
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean, error?: string, userId?: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, userId: data.user.id }
}

/**
 * Signs out the current user
 */
export async function signOut() {
  const supabase = await createClient()

  // Clear auth session
  await supabase.auth.signOut()

  // Clear cookies
  const ck = await cookies()
  ck.delete('supabase-auth-token')

  // Redirect to home page
  redirect('/')
}

/**
 * Handles the OAuth callback and sets up the session
 * @param code - The authorization code from the OAuth provider
 */
export async function handleAuthCallback(code: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

/**
 * Resets password for a user
 * @param email - Email address of the user
 */
export async function resetPassword(email: string) {
  const env = getEnvOrThrowServerSide()
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    message: 'Password reset instructions have been sent to your email',
  }
}

/**
 * Updates user's password
 * @param newPassword - New password to set
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
