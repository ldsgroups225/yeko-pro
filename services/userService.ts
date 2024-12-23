'use server'

import type { IUserProfileDTO } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { ERole, roleToString } from '@/types'

/**
 * Gets the current authenticated user's basic information.
 *
 * @returns {Promise<string | null>} The current user ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return user?.id ?? null
}

/**
 * Fetches the complete user profile including role information for a director.
 *
 * @returns {Promise<IUserProfileDTO | null>} The user's complete profile or null if not found
 * @throws {Error} With message 'Unauthorized' if user is not authenticated
 * @throws {Error} With message 'Profile not found' if profile fetch fails
 * @throws {Error} With message 'School not found' if school fetch fails
 */
export async function fetchUserProfile(): Promise<IUserProfileDTO | null> {
  const supabase = createClient()

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
      classes(count),
      students(count),
      user_roles(role_id),
      school_id
    `)
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()

  if (profileError) {
    throw new Error('Profile not found')
  }

  const {
    data: school,
    error: schoolError,
  } = await supabase.from('schools').select('*').eq('id', profile.school_id!).single()

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
      cycleId: school.cycle_id,
      imageUrl: school.image_url ?? '',
      classCount: (profile.classes[0] as any)?.count ?? 0,
      studentCount: (profile.students[0] as any)?.count ?? 0,
      createdAt: school.created_at ?? '',
      createdBy: school.created_by ?? '',
      updatedAt: school.updated_at ?? '',
      updatedBy: school.updated_by ?? '',
    },
  }
}
