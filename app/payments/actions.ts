'use server'

import type { SearchFormData } from './schemas'
import type { ISchool, IStudent, SearchResult } from './types'
import { searchSchema } from './schemas'
import { createClient, SupabaseClient } from '@/lib/supabase/server'

/**
 * Function to fetch a school by its code
 * @param client - SupabaseClient instance
 * @param code - School code
 * @returns The school corresponding to the code or an error if not found
 */
async function fetchSchoolByCode(client: SupabaseClient, code: string): Promise<ISchool> {
  const { data, error } = await client.from('schools')
    .select('*')
    .eq('code', code)
    .single()

  if (error) {
    console.error('Error fetching school:', error)
    throw new Error('École non trouvée')
  }
  
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    address: data.address,
    imageUrl: data.image_url,
    city: data.city,
    email: data.email,
    cycleId: data.cycle_id,
    isTechnicalEducation: data.is_technical_education,
    phone: data.phone,
    stateId: data.state_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
  } satisfies ISchool
}

/**
 * Function to fetch a student by their ID
 * @param client - SupabaseClient instance
 * @param id - Student ID
 * @returns The student corresponding to the ID or null if not found
 */
async function fetchStudentById(client: SupabaseClient, id: string): Promise<IStudent | null> {
  const { data, error } = await client.from('students')
    .select('*')
    .eq('id_number', id)
    .single()

  if (error) {
    console.error('Error fetching student:', error)
    return null
  }

  return {
    id: data.id,
    idNumber: data.id_number,
    firstName: data.first_name,
    lastName: data.last_name,
    address: data.address,
    gender: data.gender,
    birthDate: data.date_of_birth,
    avatarUrl: data.avatar_url,
    parentId: data.parent_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    classId: null,
    gradeId: null,
    schoolId: null,
  } satisfies IStudent
}

/**
 * Function to search for a student and a school based on a form
 * @param prevState - The previous state of the search
 * @param formData - The form data
 * @returns An object containing the search results
 */
export async function searchStudentAndSchool(
  prevState: SearchResult | null,
  formData: FormData,
): Promise<SearchResult> {
  try {
    // Extraire et valider les données du FormData
    const data: SearchFormData = {
      studentId: formData.get('studentId') as string,
      schoolCode: formData.get('schoolCode') as string,
    }

    
    // Valider avec Zod
    const validatedData = searchSchema.parse(data)
    const client = createClient()

    const [school, student] = await Promise.all([
      fetchSchoolByCode(client, validatedData.schoolCode),
      fetchStudentById(client, validatedData.studentId),
    ])

    const isFirstAttempt = !student && !prevState?.student

    return {
      student,
      school,
      isFirstAttempt,
      error: undefined,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        student: null,
        school: null,
        isFirstAttempt: false,
        error: error.message,
      }
    }
    return {
      student: null,
      school: null,
      isFirstAttempt: false,
      error: 'Une erreur est survenue',
    }
  }
}

