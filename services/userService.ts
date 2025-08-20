'use server'

import type { IUserProfileDTO } from '@/types'
import { cookies } from 'next/headers'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'
import { ERole, roleToString } from '@/types'

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
 * Fetches the complete user profile including role information for a director.
 *
 * @returns {Promise<IUserProfileDTO>} The user's complete profile or null if not found
 * @throws {Error} With message 'Unauthorized' if user is not authenticated
 * @throws {Error} With message 'Profile not found' if profile fetch fails
 * @throws {Error} With message 'School not found' if school fetch fails
 */
export async function fetchUserProfile(): Promise<IUserProfileDTO> {
  const supabase = await createClient()

  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(`
      id,
      email,
      first_name,
      last_name,
      phone,
      user_roles(role_id),
      school_id
    `)
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()

  if (profileError) {
    throw new Error('Profile not found')
  }

  const { count: studentCount, error: studentCountError } = await supabase
    .from('student_school_class')
    .select('*', { count: 'estimated' })
    .eq('school_id', profile.school_id!)
    .eq('enrollment_status', 'accepted')
    .is('is_active', true)
    // TODO: .eq('school_years_id', 2023)  // Filter by school year

  if (studentCountError) {
    throw new Error('Failed to fetch student count')
  }

  const {
    data: school,
    error: schoolError,
  } = await supabase.from('schools').select('*, classes(count)').eq('id', profile.school_id!).single()

  if (schoolError || !school) {
    throw new Error('School not found')
  }

  return {
    id: userId,
    email: profile.email!,
    firstName: profile.first_name ?? '',
    lastName: profile.last_name ?? '',
    fullName: `${profile.first_name} ${profile.last_name}`,
    phoneNumber: profile.phone ?? '',
    role: roleToString(ERole.DIRECTOR),
    school: {
      id: school.id,
      name: school.name,
      code: school.code,
      city: school.city,
      phone: school.phone,
      email: school.email,
      address: school.address,
      cycleId: school.cycle_id,
      imageUrl: school.image_url ?? '',
      classCount: (school.classes[0] as any)?.count ?? 0,
      studentCount: studentCount ?? 0,
      createdAt: school.created_at ?? '',
      createdBy: school.created_by ?? '',
      updatedAt: school.updated_at ?? '',
      updatedBy: school.updated_by ?? '',
    },
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
export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
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
