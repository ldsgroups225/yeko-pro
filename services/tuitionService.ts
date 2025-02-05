// services/tuitionService.ts
'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import type { TuitionSettings } from '@/validations'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

type TuitionSettingsRead = Database['public']['Tables']['tuition_settings']['Row']
type TuitionSettingsInsert = Database['public']['Tables']['tuition_settings']['Insert']

/**
 * Serializes a partial TuitionSettings object into a format suitable for insertion into the database.
 *
 * @param {Partial<TuitionSettings>} data - Partial tuition settings data.
 * @returns {TuitionSettingsInsert} Serialized tuition settings ready for database insertion.
 */
function serializeTuition(data: Partial<TuitionSettings>): TuitionSettingsInsert {
  return {
    grade_id: data.gradeId!,
    school_id: data.schoolId!,
    annual_fee: data.annualFee!,
    government_discount_percentage: data.governmentDiscountPercentage,
  }
}

/**
 * Deserializes a TuitionSettingsRead object from the database into a TuitionSettings object.
 *
 * @param {TuitionSettingsRead} data - Tuition settings data fetched from the database.
 * @returns {TuitionSettings} Deserialized tuition settings object.
 */
function deserializeTuition(data: TuitionSettingsRead): TuitionSettings {
  return {
    id: data.id,
    gradeId: data.grade_id,
    schoolId: data.school_id,
    annualFee: data.annual_fee,
    createdAt: data.created_at!,
    updatedAt: data.updated_at!,
    governmentDiscountPercentage: data.government_discount_percentage,
  }
}

/**
 * Retrieves the authenticated user's ID using the provided Supabase client.
 *
 * @param {SupabaseClient} client - The Supabase client instance.
 * @returns {Promise<string>} A promise that resolves to the authenticated user's ID.
 * @throws Will throw an error if fetching the user fails.
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
 *
 * @param {SupabaseClient} client - The Supabase client instance.
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<string>} A promise that resolves to the director's school ID.
 * @throws Will throw an error if the user is not a director or if there is an issue fetching the school ID.
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
 * Retrieves tuition settings for the school associated with the authenticated director.
 *
 * @returns {Promise<TuitionSettings[]>} A promise that resolves to an array of tuition settings.
 * @throws Will throw an error if there is an issue fetching the tuition settings.
 */
export async function getTuitions(): Promise<TuitionSettings[]> {
  const supabase = createClient()

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  const { data, error } = await supabase
    .from('tuition_settings')
    .select('*')
    .eq('school_id', schoolId)
    .throwOnError()

  if (error) {
    console.error('Error fetching tuitions:', error)
    throw new Error('Erreur lors de la récupération des frais scolaires')
  }

  return data.map(deserializeTuition)
}

/**
 * Updates or creates tuition settings for a specific grade.
 *
 * If no tuition record exists for the provided grade and school, a new record is inserted.
 * Otherwise, the existing record is updated.
 *
 * @param {Partial<TuitionSettings>} data - Partial tuition settings data to update.
 * @param {number} gradeId - The grade identifier for which the tuition settings should be updated.
 * @returns {Promise<TuitionSettings>} A promise that resolves to the updated or newly created tuition settings.
 * @throws Will throw an error if there is an issue updating or creating the tuition settings.
 */
export async function updateTuition(
  data: Partial<TuitionSettings>,
  gradeId: number,
): Promise<TuitionSettings> {
  const client = createClient()

  try {
    const userId = await checkAuthUserId(client)
    const schoolId = await getDirectorSchoolId(client, userId)

    // Data Sanitization: remove fields that should not be updated.
    delete data.id
    delete data.schoolId
    delete data.createdAt
    delete data.updatedAt

    const { data: tuition, error: tuitionError } = await client
      .from('tuition_settings')
      .select('id')
      .eq('grade_id', gradeId)
      .eq('school_id', schoolId)
      .maybeSingle()
      .throwOnError()

    if (tuitionError) {
      console.error('Error fetching tuition:', tuitionError)
      throw new Error('Erreur lors de la récupération des frais scolaires')
    }

    if (!tuition) {
      // No record exists: insert a new tuition settings record.
      const { data: newTuition, error } = await client
        .from('tuition_settings')
        .insert({ ...serializeTuition(data), school_id: schoolId, grade_id: gradeId })
        .select('*')
        .single()
        .throwOnError()

      if (error) {
        console.error('Error creating tuition:', error)
        throw new Error('Erreur lors de la création du frais scolaires')
      }

      return deserializeTuition(newTuition)
    }
    else {
      // Record exists: update the existing record.
      const { data: updatedTuition, error } = await client
        .from('tuition_settings')
        .update({ ...serializeTuition(data), school_id: schoolId })
        .eq('id', tuition.id)
        .select('*')
        .single()
        .throwOnError()

      if (error) {
        console.error('Error updating tuition:', error)
        throw new Error('Erreur lors de la mise à jour du frais scolaires')
      }

      return deserializeTuition(updatedTuition)
    }
  }
  catch (error: any) {
    console.error('Unexpected error in updateTuition:', error)
    throw new Error(error.message)
  }
}
