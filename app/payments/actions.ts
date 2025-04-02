'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { SearchFormData } from './schemas'
import type { ISchool, IStudent, SearchResult } from './types'
import { createClient } from '@/lib/supabase/server'
import { searchSchema } from './schemas'

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
  }
  catch (error) {
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

/**
 * Function to fetch grades for a school
 * @param schoolId - The ID of the school
 * @returns An array of grades
 */
export async function fetchGrades(schoolId: string) {
  try {
    const client = createClient()
    const { data, error } = await client
      .from('grades')
      .select(`
        id,
        name,
        cycle_id,
        description,
        tuition_settings!inner (
          school_id
        )
      `)
      .eq('tuition_settings.school_id', schoolId)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching grades:', error)
      throw new Error('Impossible de charger les niveaux')
    }

    return data.map(grade => ({
      id: grade.id,
      name: grade.name,
      cycleId: grade.cycle_id,
      description: grade.description,
    }))
  }
  catch (error) {
    console.error('Error in fetchGrades:', error)
    throw new Error('Impossible de charger les niveaux')
  }
}

/**
 * Function to fetch tuition fees for a grade
 * @param gradeId - The ID of the grade
 * @returns An array of tuition fees
 */
export async function fetchTuitionFees(gradeId: number) {
  try {
    const client = createClient()
    const { data, error } = await client.from('tuition_settings')
      .select('id, annual_fee, government_discount_percentage')
      .eq('grade_id', gradeId)

    if (error) {
      console.error('Error fetching tuition fees:', error)
      throw new Error('Impossible de charger les frais de scolarité')
    }

    return data.map(fee => ({
      id: fee.id,
      annualFee: fee.annual_fee,
      governmentDiscountPercentage: fee.government_discount_percentage,
    }))
  }
  catch (error) {
    console.error('Error in fetchTuitionFees:', error)
    throw new Error('Impossible de charger les frais de scolarité')
  }
}

/**
 * Function to create a new student
 * @param formData - The student creation form data
 * @param formData.firstName - Student's first name
 * @param formData.lastName - Student's last name
 * @param formData.gender - Student's gender ('M' or 'F')
 * @param formData.birthDate - Student's birth date
 * @param formData.address - Student's address (optional)
 * @param formData.avatarUrl - URL of student's avatar image (optional)
 * @param schoolId - The ID of the school
 * @param parentId - The ID of the parent
 * @returns The newly created student
 */
export async function createStudent(formData: {
  firstName: string
  lastName: string
  gender: 'M' | 'F'
  birthDate: string
  address?: string
  avatarUrl?: string
}, schoolId: string, parentId: string): Promise<IStudent> {
  try {
    const client = createClient()

    // Generate a unique student ID
    const { data: lastStudent } = await client.from('students')
      .select('id_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastId = lastStudent?.id_number ? Number.parseInt(lastStudent.id_number.slice(-6)) : 0
    const newIdNumber = `ST${(lastId + 1).toString().padStart(6, '0')}`

    // First create the student record
    const { data: studentData, error: studentError } = await client.from('students')
      .insert({
        id_number: newIdNumber,
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        date_of_birth: formData.birthDate,
        address: formData.address,
        avatar_url: formData.avatarUrl,
        parent_id: parentId,
      })
      .select()
      .single()

    if (studentError) {
      console.error('Error creating student:', studentError)
      throw new Error('Impossible de créer l\'élève')
    }

    // Then create the student_school_class record
    const { error: enrollmentError } = await client.from('student_school_class')
      .insert({
        student_id: studentData.id,
        school_id: schoolId,
        grade_id: 1, // Default grade, you may want to make this configurable
        school_year_id: 1, // Default school year, you may want to make this configurable
        is_active: true,
        enrollment_status: 'pending',
      })

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError)
      throw new Error('Impossible de créer l\'inscription')
    }

    return {
      id: studentData.id,
      idNumber: studentData.id_number,
      firstName: studentData.first_name,
      lastName: studentData.last_name,
      address: studentData.address,
      gender: studentData.gender,
      birthDate: studentData.date_of_birth,
      avatarUrl: studentData.avatar_url,
      parentId: studentData.parent_id,
      classId: null,
      gradeId: null,
      schoolId,
      createdAt: studentData.created_at,
      updatedAt: studentData.updated_at,
      createdBy: studentData.created_by,
      updatedBy: studentData.updated_by,
    } satisfies IStudent
  }
  catch (error) {
    console.error('Error in createStudent:', error)
    throw new Error('Impossible de créer l\'élève')
  }
}
