'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

/**
 * Retrieves the authenticated user's ID using the provided Supabase client.
 * This function verifies user authentication and is used as a prerequisite for other operations.
 *
 * @async
 * @param {SupabaseClient} client - The Supabase client instance configured for server-side operations.
 * @returns {Promise<string>} A promise that resolves to the authenticated user's ID.
 * @throws {Error} Will throw an error if fetching the user fails, indicating an authentication issue.
 */
async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

/**
 * Retrieves the school ID associated with the director user.
 * This function assumes the user is a director and fetches their associated school ID from the database.
 * It also verifies that the user has the DIRECTOR role.
 *
 * @async
 * @param {SupabaseClient} client - The Supabase client instance configured for server-side operations.
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<string>} A promise that resolves to the director's school ID.
 * @throws {Error}
 *  - Will throw an error if the user is not a director.
 *  - Will throw an error if there is an issue fetching the school ID from the database.
 *  - Will throw an error if the user is not associated with any school.
 */
async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error: userSchoolError } = await client
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()
  if (userSchoolError) {
    console.error('Error fetching user school:', userSchoolError)
    throw new Error('Seul un directeur peut accéder à cette page')
  }

  if (!userSchool.school_id) {
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }
  return userSchool.school_id
}

/**
 * Fetches all subject IDs associated with a specific school for a given school year.
 * Returns an array of subject IDs for the given school and school year.
 *
 * @param {string} schoolId - The ID of the school to fetch subjects for
 * @param {number} schoolYearId - The ID of the school year to fetch subjects for
 * @returns {Promise<string[]>} Array of subject IDs. Returns empty array if no subjects found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching school subjects ('Failed to fetch school subjects')
 */
export async function fetchSchoolSubjectIds(schoolId: string, schoolYearId: number): Promise<string[]> {
  if (!schoolId) {
    throw new Error('School ID is required')
  }

  if (!schoolYearId) {
    throw new Error('School Year ID is required')
  }

  const supabase = await createClient()

  // Check authentication and authorization
  const userId = await checkAuthUserId(supabase)
  const userSchoolId = await getDirectorSchoolId(supabase, userId)

  // Verify the user can only access subjects for their own school
  if (schoolId !== userSchoolId) {
    throw new Error('Vous ne pouvez consulter que les matières de votre établissement')
  }

  const { data, error } = await supabase
    .from('school_subjects')
    .select('subject_id')
    .eq('school_id', schoolId)
    .eq('school_year_id', schoolYearId)
    .throwOnError()

  if (error) {
    console.error('Error fetching school subjects:', error)
    throw new Error('Failed to fetch school subjects')
  }

  return data?.map(item => item.subject_id) ?? []
}

/**
 * Saves the list of subject IDs for a specific school.
 * Uses a delete-then-insert approach to ensure data consistency.
 * Requires a current school year to be set in the database.
 *
 * @param {string} schoolId - The ID of the school to save subjects for
 * @param {string[]} subjectIds - Array of subject IDs to associate with the school
 * @returns {Promise<void>}
 * @throws {Error} If school ID is not provided ('School ID is required')
 * @throws {Error} If subject IDs array is not provided ('Subject IDs array is required')
 * @throws {Error} If no current school year is found ('No current school year found')
 * @throws {Error} If there's an error during the save operation ('Failed to save school subjects')
 */
export async function saveSchoolSubjects(schoolId: string, subjectIds: string[]): Promise<void> {
  if (!schoolId) {
    throw new Error('School ID is required')
  }

  if (!Array.isArray(subjectIds)) {
    throw new TypeError('Subject IDs array is required')
  }

  const supabase = await createClient()

  // First, get the current school year
  const { data: currentSchoolYear, error: schoolYearError } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (schoolYearError || !currentSchoolYear) {
    console.error('Error fetching current school year:', schoolYearError)
    throw new Error('No current school year found')
  }

  // Use a transaction-like approach: delete existing entries, then insert new ones
  try {
    // Delete existing school subjects for this school
    const { error: deleteError } = await supabase
      .from('school_subjects')
      .delete()
      .eq('school_id', schoolId)
      .throwOnError()

    if (deleteError) {
      console.error('Error deleting existing school subjects:', deleteError)
      throw new Error('Failed to delete existing school subjects')
    }

    // Insert new school subjects if subjectIds is not empty
    if (subjectIds.length > 0) {
      const schoolSubjectsToInsert = subjectIds.map(subjectId => ({
        school_id: schoolId,
        school_year_id: currentSchoolYear.id,
        subject_id: subjectId,
      }))

      const { error: insertError } = await supabase
        .from('school_subjects')
        .insert(schoolSubjectsToInsert)
        .throwOnError()

      if (insertError) {
        console.error('Error inserting school subjects:', insertError)
        throw new Error('Failed to insert school subjects')
      }
    }
  }
  catch (error) {
    console.error('Error saving school subjects:', error)
    throw new Error('Failed to save school subjects')
  }
}

/**
 * Saves the list of subject IDs for a specific school and school year.
 * Uses a delete-then-insert approach to ensure data consistency.
 *
 * @param {string} schoolId - The ID of the school to save subjects for
 * @param {number} schoolYearId - The ID of the school year
 * @param {string[]} subjectIds - Array of subject IDs to associate with the school
 * @returns {Promise<void>}
 * @throws {Error} If school ID is not provided ('School ID is required')
 * @throws {Error} If school year ID is not provided ('School Year ID is required')
 * @throws {Error} If subject IDs array is not provided ('Subject IDs array is required')
 * @throws {Error} If there's an error during the save operation ('Failed to save school subjects')
 */
export async function saveSchoolSubjectsForYear(schoolId: string, schoolYearId: number, subjectIds: string[]): Promise<void> {
  if (!schoolId) {
    throw new Error('School ID is required')
  }

  if (!schoolYearId) {
    throw new Error('School Year ID is required')
  }

  if (!Array.isArray(subjectIds)) {
    throw new TypeError('Subject IDs array is required')
  }

  const supabase = await createClient()

  // Check authentication and authorization
  const userId = await checkAuthUserId(supabase)
  const userSchoolId = await getDirectorSchoolId(supabase, userId)

  // Verify the user can only modify subjects for their own school
  if (schoolId !== userSchoolId) {
    throw new Error('Vous ne pouvez modifier que les matières de votre établissement')
  }

  // Use a transaction-like approach: delete existing entries, then insert new ones
  try {
    // Delete existing school subjects for this school and school year
    const { error: deleteError } = await supabase
      .from('school_subjects')
      .delete()
      .eq('school_id', schoolId)
      .eq('school_year_id', schoolYearId)
      .throwOnError()

    if (deleteError) {
      console.error('Error deleting existing school subjects:', deleteError)
      throw new Error('Failed to delete existing school subjects')
    }

    // Insert new school subjects if subjectIds is not empty
    if (subjectIds.length > 0) {
      const schoolSubjectsToInsert = subjectIds.map(subjectId => ({
        school_id: schoolId,
        school_year_id: schoolYearId,
        subject_id: subjectId,
      }))

      const { error: insertError } = await supabase
        .from('school_subjects')
        .insert(schoolSubjectsToInsert)
        .throwOnError()

      if (insertError) {
        console.error('Error inserting school subjects:', insertError)
        throw new Error('Failed to insert school subjects')
      }
    }
  }
  catch (error) {
    console.error('Error saving school subjects:', error)
    throw new Error('Failed to save school subjects')
  }
}
