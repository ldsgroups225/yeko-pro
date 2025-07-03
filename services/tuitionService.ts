// services/tuitionService.ts

'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { InstallmentTemplate, TuitionSettings } from '@/validations'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'
import { deserializeInstallmentTemplate, deserializeTuition, serializeInstallmentTemplate, serializeTuition } from '@/validations'

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
 * Retrieves tuition settings for the school associated with the authenticated director.
 * This function fetches all tuition settings records associated with the school of the currently logged-in director.
 *
 * @async
 * @returns {Promise<TuitionSettings[]>} A promise that resolves to an array of tuition settings for the director's school.
 * @throws {Error}
 *  - Will throw an error if user authentication fails.
 *  - Will throw an error if the authenticated user is not a director or their school ID cannot be retrieved.
 *  - Will throw an error if there is an issue fetching the tuition settings from the database.
 */
export async function getTuitions(): Promise<TuitionSettings[]> {
  const supabase = await createClient()

  try {
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
  catch (error: any) {
    console.error('Unexpected error in getTuitions:', error)
    throw new Error(error.message)
  }
}

/**
 * Updates or creates tuition settings for a specific grade.
 * If no tuition record exists for the provided grade and school, a new record is inserted.
 * Otherwise, the existing record is updated with the provided data.
 *
 * @async
 * @param {Partial<TuitionSettings>} data - Partial tuition settings data to update. Fields like `id`, `schoolId`, `createdAt`, and `updatedAt` will be ignored for updates.
 * @param {number} gradeId - The grade identifier for which the tuition settings should be updated.
 * @returns {Promise<TuitionSettings>} A promise that resolves to the updated or newly created tuition settings.
 * @throws {Error}
 *  - Will throw an error if user authentication fails.
 *  - Will throw an error if the authenticated user is not a director or their school ID cannot be retrieved.
 *  - Will throw an error if there is an issue fetching, creating, or updating the tuition settings in the database.
 */
export async function updateTuition(
  data: Partial<TuitionSettings>,
  gradeId: number,
): Promise<TuitionSettings> {
  const client = await createClient()

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

/**
 * Retrieves installment templates for a specific grade within the director's school.
 *
 * @async
 * @param {number} gradeId - The grade identifier for which to retrieve installment templates.
 * @returns {Promise<InstallmentTemplate[]>} A promise that resolves to an array of installment templates for the specified grade.
 * @throws {Error}
 *  - Will throw an error if user authentication fails.
 *  - Will throw an error if the authenticated user is not a director or their school ID cannot be retrieved.
 *  - Will throw an error if there is an issue fetching the installment templates from the database.
 */
export async function getInstallmentTemplates(gradeId: number): Promise<InstallmentTemplate[]> {
  const supabase = await createClient()

  try {
    const userId = await checkAuthUserId(supabase)
    const schoolId = await getDirectorSchoolId(supabase, userId)

    const { data, error } = await supabase
      .from('installment_templates')
      .select('*')
      .eq('grade_id', gradeId)
      .eq('school_id', schoolId)
      .order('installment_number', { ascending: true })
      .throwOnError()

    if (error) {
      console.error('Error fetching installment templates:', error)
      throw new Error('Erreur lors de la récupération des plans de paiement')
    }

    return data.map(deserializeInstallmentTemplate)
  }
  catch (error: any) {
    console.error('Unexpected error in getInstallmentTemplates:', error)
    throw new Error(error.message)
  }
}

/**
 * Updates or creates an installment template for a specific grade.
 * If no installment template record exists for the provided grade and school, a new record is inserted.
 * Otherwise, the existing record is updated with the provided data.
 *
 * @async
 * @param {Partial<InstallmentTemplate>} data - Partial installment template data to update. Fields like `id` and `schoolId` will be ignored for updates.
 * @param {string?} id - The identifier for which the installment template should be updated.
 * @returns {Promise<InstallmentTemplate>} A promise that resolves to the updated or newly created installment template.
 * @throws {Error}
 *  - Will throw an error if user authentication fails.
 *  - Will throw an error if the authenticated user is not a director or their school ID cannot be retrieved.
 *  - Will throw an error if there is an issue fetching, creating, or updating the installment template in the database.
 */
export async function updateInstallmentTemplate(data: Partial<InstallmentTemplate>, id?: string): Promise<InstallmentTemplate> {
  const supabase = await createClient()

  try {
    const userId = await checkAuthUserId(supabase)
    const schoolId = await getDirectorSchoolId(supabase, userId)

    if (!id) {
      // No record exists: insert a new installment template record.
      const { data: newInstallmentTemplate, error } = await supabase
        .from('installment_templates')
        .insert({ ...serializeInstallmentTemplate(data), school_id: schoolId })
        .select('*')
        .single()
        .throwOnError()

      if (error) {
        console.error('Error creating installment template:', error)
        throw new Error('Erreur lors de la création du plan de paiement')
      }

      return deserializeInstallmentTemplate(newInstallmentTemplate)
    }
    else {
      // Record exists: update the existing record.
      const { data: updatedInstallmentTemplate, error } = await supabase
        .from('installment_templates')
        .update({ ...serializeInstallmentTemplate(data), school_id: schoolId })
        .eq('id', id)
        .select('*')
        .single()
        .throwOnError()

      if (error) {
        console.error('Error updating installment template:', error)
        throw new Error('Erreur lors de la mise à jour du plan de paiement')
      }

      return deserializeInstallmentTemplate(updatedInstallmentTemplate)
    }
  }
  catch (error: any) {
    console.error('Unexpected error in updateInstallmentTemplate:', error)
    throw new Error(error.message)
  }
}

export async function deleteInstallmentTemplate(id: string): Promise<void> {
  const supabase = await createClient()
  try {
    const userId = await checkAuthUserId(supabase)
    const schoolId = await getDirectorSchoolId(supabase, userId)
    const { error } = await supabase
      .from('installment_templates')
      .delete()
      .eq('id', id)
      .eq('school_id', schoolId)
      .throwOnError()
    if (error) {
      console.error('Error deleting installment template:', error)
      throw new Error('Erreur lors de la suppression du plan de paiement')
    }
  }
  catch (error: any) {
    console.error('Unexpected error in deleteInstallmentTemplate:', error)
    throw new Error(error.message)
  }
}
