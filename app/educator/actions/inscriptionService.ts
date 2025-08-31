// app/educator/actions/inscriptionService.ts

'use server'

import type { StudentSearchFormData } from '../schemas/inscription'
import type {
  IClass,
  IGrade,
  IInscriptionQueryParams,
  IInscriptionRecord,
  IInscriptionResponse,
  IInscriptionStats,
  IPendingInscription,
  IStudentSearchResponse,
  IStudentSearchResult,
} from '../types/inscription'
import type { SupabaseClient } from '@/lib/supabase/server'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { formatFullName, parseMedicalCondition } from '@/lib/utils'
import { studentSearchSchema } from '../schemas/inscription'

async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) {
    throw new Error('Utilisateur non authentifié')
  }
  return user.id
}

async function getUserSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userData, error: userError } = await client
    .from('users')
    .select('school_id')
    .eq('id', userId)
    .single()

  if (userError || !userData?.school_id) {
    throw new Error('École de l\'utilisateur non trouvée')
  }
  return userData.school_id
}

async function getCurrentSchoolYear(client: SupabaseClient): Promise<number> {
  const { data, error } = await client
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (error || !data) {
    throw new Error('Année scolaire courante non trouvée')
  }
  return data.id
}

export async function getEducatorInscriptions(params: IInscriptionQueryParams = {}): Promise<IInscriptionResponse> {
  try {
    const client = await createClient()
    const userId = await checkAuthUserId(client)
    const schoolId = await getUserSchoolId(client, userId)
    const currentSchoolYear = await getCurrentSchoolYear(client)

    const {
      page = 1,
      limit = 10,
      searchTerm,
      enrollmentStatus,
      gradeId,
      classId,
      isGovernmentAffected,
      isOrphan,
      sort = { column: 'created_at', direction: 'desc' },
    } = params

    // Build query
    let query = client
      .from('student_school_class')
      .select(`
        *,
        students:student_id (
          id,
          first_name,
          last_name,
          id_number,
          avatar_url,
          parent_id,
          users:parent_id (
            first_name,
            last_name,
            phone
          )
        ),
        classes:class_id (
          id,
          name,
          grade_id,
          grades:grade_id (
            id,
            name
          )
        )
      `)
      .eq('school_id', schoolId)
      .eq('school_year_id', currentSchoolYear)

    // Apply filters
    if (searchTerm) {
      query = query.or(`
        students.first_name.ilike.%${searchTerm}%,
        students.last_name.ilike.%${searchTerm}%,
        students.id_number.ilike.%${searchTerm}%
      `)
    }

    if (enrollmentStatus) {
      query = query.eq('enrollment_status', enrollmentStatus)
    }

    if (gradeId) {
      query = query.eq('grade_id', gradeId)
    }

    if (classId) {
      query = query.eq('class_id', classId)
    }

    if (typeof isGovernmentAffected === 'boolean') {
      query = query.eq('is_government_affected', isGovernmentAffected)
    }

    if (typeof isOrphan === 'boolean') {
      query = query.eq('is_orphan', isOrphan)
    }

    // Apply sorting
    query = query.order(sort.column, { ascending: sort.direction === 'asc' })

    // Get total count for pagination
    const { count } = await client
      .from('student_school_class')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('school_year_id', currentSchoolYear)

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching inscriptions:', error)
      throw new Error('Erreur lors de la récupération des inscriptions')
    }

    // Transform data
    const inscriptions: IInscriptionRecord[] = (data || []).map((record: any) => ({
      id: record.id,
      studentId: record.student_id,
      studentFirstName: record.students?.first_name || '',
      studentLastName: record.students?.last_name || '',
      studentIdNumber: record.students?.id_number || '',
      studentAvatarUrl: record.students?.avatar_url,
      parentId: record.students?.parent_id || '',
      parentFirstName: record.students?.users?.first_name,
      parentLastName: record.students?.users?.last_name,
      parentPhone: record.students?.users?.phone,
      classId: record.class_id,
      className: record.classes?.name,
      gradeName: record.classes?.grades?.name || '',
      gradeId: record.grade_id,
      schoolId: record.school_id,
      schoolYearId: record.school_year_id,
      enrollmentStatus: record.enrollment_status,
      isActive: record.is_active,
      isGovernmentAffected: record.is_government_affected,
      isOrphan: record.is_orphan,
      isRedoublement: record.is_redoublement,
      isSubscribedToCanteen: record.is_subscribed_to_canteen,
      isSubscribedToTransportation: record.is_subscribed_to_transportation,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      updatedBy: record.updated_by,
    }))

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return {
      inscriptions,
      totalCount,
      totalPages,
      currentPage: page,
    }
  }
  catch (error) {
    console.error('Error in getEducatorInscriptions:', error)
    throw error
  }
}

export async function getEducatorInscriptionStats(): Promise<IInscriptionStats> {
  try {
    const client = await createClient()
    const userId = await checkAuthUserId(client)
    const schoolId = await getUserSchoolId(client, userId)
    const currentSchoolYear = await getCurrentSchoolYear(client)

    // Get all inscriptions for the current school year
    const { data: inscriptions, error } = await client
      .from('student_school_class')
      .select('*')
      .eq('school_id', schoolId)
      .eq('school_year_id', currentSchoolYear)

    if (error) {
      console.error('Error fetching inscription stats:', error)
      throw new Error('Erreur lors de la récupération des statistiques')
    }

    const totalInscriptions = inscriptions?.length || 0
    const activeInscriptions = inscriptions?.filter(i => i.is_active && i.enrollment_status === 'active').length || 0
    const pendingInscriptions = inscriptions?.filter(i => i.enrollment_status === 'pending').length || 0
    const orphanStudents = inscriptions?.filter(i => i.is_orphan).length || 0
    const governmentAffectedStudents = inscriptions?.filter(i => i.is_government_affected).length || 0
    const canteenSubscriptions = inscriptions?.filter(i => i.is_subscribed_to_canteen).length || 0
    const transportationSubscriptions = inscriptions?.filter(i => i.is_subscribed_to_transportation).length || 0

    // Get this month's inscriptions
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const thisMonthInscriptions = inscriptions?.filter((i) => {
      if (!i.created_at)
        return false
      const createdDate = new Date(i.created_at)
      return createdDate >= thisMonth
    }).length || 0

    return {
      totalInscriptions,
      pendingInscriptions,
      activeInscriptions,
      thisMonthInscriptions,
      orphanStudents,
      governmentAffectedStudents,
      canteenSubscriptions,
      transportationSubscriptions,
    }
  }
  catch (error) {
    console.error('Error in getEducatorInscriptionStats:', error)
    throw error
  }
}

export async function getEducatorGrades(): Promise<IGrade[]> {
  try {
    const client = await createClient()
    const userId = await checkAuthUserId(client)
    const schoolId = await getUserSchoolId(client, userId)

    // Get school cycle to filter grades
    const { data: school, error: schoolError } = await client
      .from('schools')
      .select('cycle_id')
      .eq('id', schoolId)
      .single()

    if (schoolError || !school) {
      throw new Error('École non trouvée')
    }

    const { data, error } = await client
      .from('grades')
      .select('id, name')
      .eq('cycle_id', school.cycle_id)
      .order('name')

    if (error) {
      console.error('Error fetching grades:', error)
      throw new Error('Erreur lors de la récupération des niveaux')
    }

    return (data || []).map(grade => ({
      id: grade.id,
      name: grade.name,
    }))
  }
  catch (error) {
    console.error('Error in getEducatorGrades:', error)
    throw error
  }
}

export async function getEducatorClasses(): Promise<IClass[]> {
  try {
    const client = await createClient()
    const userId = await checkAuthUserId(client)
    const schoolId = await getUserSchoolId(client, userId)

    const { data, error } = await client
      .from('classes')
      .select(`
        id,
        name,
        grade_id,
        max_student,
        grades:grade_id (
          id,
          name
        )
      `)
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching classes:', error)
      throw new Error('Erreur lors de la récupération des classes')
    }

    return (data || []).map((classItem: any) => ({
      id: classItem.id,
      name: classItem.name,
      gradeId: classItem.grade_id,
      gradeName: classItem.grades?.name || '',
      maxStudent: classItem.max_student,
    }))
  }
  catch (error) {
    console.error('Error in getEducatorClasses:', error)
    throw error
  }
}

export async function updateInscriptionStatus(inscriptionId: string, status: string): Promise<void> {
  try {
    const client = await createClient()
    const userId = await checkAuthUserId(client)

    const { error } = await client
      .from('student_school_class')
      .update({
        enrollment_status: status,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inscriptionId)

    if (error) {
      throw new Error('Erreur lors de la mise à jour du statut')
    }
  }
  catch (error) {
    console.error('Error in updateInscriptionStatus:', error)
    throw error
  }
}

export async function getPendingInscriptions(): Promise<IPendingInscription[]> {
  const supabase = await createClient()

  // get teacher candidatures
  const teachersQs = supabase
    .from('schools_teachers')
    .select('status, created_at, teacher:users(id, first_name, last_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // get student candidatures
  const studentsQs = supabase
    .from('student_school_class')
    .select('grade_id, enrollment_status, created_at, student:students(id, first_name, last_name)')
    .eq('enrollment_status', 'pending')
    .order('created_at', { ascending: true })

  // promise all
  const [
    { data: teachers, error: teachersError },
    { data: students, error: studentsError },
  ] = await Promise.all([
    teachersQs,
    studentsQs,
  ])

  if (teachersError || studentsError) {
    console.error('Error fetching candidatures:', teachersError?.message || studentsError?.message)
    return []
  }

  const deserializeTeachers: IPendingInscription[] = teachers.map(
    teacher => ({
      candidateId: teacher.teacher.id,
      time: teacher.created_at!,
      name: formatFullName(
        teacher.teacher.first_name!,
        teacher.teacher.last_name!,
        teacher.teacher.email,
      ),
      type: 'teacher',
      status: teacher.status,
    }),
  )

  const deserializeStudents: IPendingInscription[] = students.map(
    student => ({
      candidateId: student.student.id,
      time: student.created_at!,
      name: formatFullName(
        student.student.first_name!,
        student.student.last_name!,
      ),
      type: 'student',
      status: student.enrollment_status,
      grade: student.grade_id,
    }),
  )

  const mergedData = [...deserializeTeachers, ...deserializeStudents]

  // return sorted mergedData
  return mergedData.sort((a, b) => {
    if (a.time > b.time)
      return -1
    if (a.time < b.time)
      return 1
    return 0
  })
}

/**
 * Search for existing students by ID number or name
 */
export async function searchExistingStudent(data: StudentSearchFormData): Promise<IStudentSearchResponse> {
  try {
    // Validate input data
    const validatedData = studentSearchSchema.parse(data)

    const client = await createClient()
    const userId = await checkAuthUserId(client)
    const _schoolId = await getUserSchoolId(client, userId)

    let query = client
      .from('students')
      .select(`
        id,
        id_number,
        first_name,
        last_name,
        gender,
        date_of_birth,
        address,
        avatar_url,
        medical_condition,
        parent_id,
        extra_parent,
        created_at,
        updated_at
      `)

    if (validatedData.searchType === 'idNumber' && validatedData.idNumber) {
      query = query.eq('id_number', validatedData.idNumber.trim().toUpperCase())
    }
    else if (validatedData.searchType === 'name' && validatedData.firstName && validatedData.lastName) {
      query = query
        .ilike('first_name', `%${validatedData.firstName.trim()}%`)
        .ilike('last_name', `%${validatedData.lastName.trim()}%`)
    }

    const { data: studentData, error } = await query.maybeSingle()

    if (error) {
      console.error('Error searching for student:', error)
      return {
        student: null,
        error: 'Erreur lors de la recherche de l\'élève',
      }
    }

    if (!studentData) {
      return {
        student: null,
        error: undefined,
      }
    }

    // Parse medical condition
    const medicalCondition = parseMedicalCondition(studentData.medical_condition)

    // Transform the database extra_parent to secondParent format
    const extraParent = studentData.extra_parent
      ? {
          id: nanoid(),
          fullName: (studentData.extra_parent as any).full_name,
          gender: (studentData.extra_parent as any).gender,
          phone: (studentData.extra_parent as any).phone,
          type: (studentData.extra_parent as any).type,
        }
      : null

    // Map to IStudentSearchResult
    const student: IStudentSearchResult = {
      id: studentData.id,
      idNumber: studentData.id_number,
      firstName: studentData.first_name,
      lastName: studentData.last_name,
      gender: studentData.gender,
      birthDate: studentData.date_of_birth,
      address: studentData.address,
      avatarUrl: studentData.avatar_url,
      medicalCondition,
      parentId: studentData.parent_id,
      extraParent,
      createdAt: studentData.created_at,
      updatedAt: studentData.updated_at,
    }

    return {
      student,
      error: undefined,
    }
  }
  catch (error) {
    console.error('Error in searchExistingStudent:', error)
    return {
      student: null,
      error: error instanceof Error ? error.message : 'Erreur lors de la recherche',
    }
  }
}

/**
 * Links a parent to students based on phone number matching.
 * Updates students with matching parent_phone to set parent_id.
 * @param {string} studentId - The student ID
 * @param {string} phone - The parent's phone number
 * @returns {Promise<number>} - Number of students linked
 */
async function linkParentToStudentsByPhone(client: SupabaseClient, studentId: string, phone: string): Promise<void> {
  try {
    // Find parent with matching phone
    const { data: parent, error: fetchError } = await client
      .from('users')
      .select('id')
      .ilike('phone', phone)
      .single()

    if (fetchError) {
      console.error('Error fetching parent by phone:', fetchError)
      return
    }

    if (!parent) {
      return
    }

    // Update matching students with parent_id
    const { error: updateError } = await client
      .from('students')
      .update({ parent_id: parent.id })
      .eq('id', studentId)

    if (updateError) {
      console.error('Error updating students parent_id:', updateError)
    }
  }
  catch (error) {
    console.error('Error linking parent to students:', error)
  }
}

/**
 * @param formData - The form data for creating a student
 * @param formData.firstName - Student's first name
 * @param formData.lastName - Student's last name
 * @param formData.gender - Student's gender ('M' or 'F')
 * @param formData.birthDate - Student's birth date
 * @param formData.address - Student's address (optional)
 * @param formData.idNumber - Student's ID number (optional)
 * @param formData.medicalCondition - Student's medical condition (optional)
 * @param formData.avatarUrl - URL of student's avatar image (optional)
 * @param formData.secondParent - The second parent of the student (optional)
 * @param formData.secondParent.fullName - The full name of the second parent
 * @param formData.secondParent.gender - The gender of the second parent ('M' or 'F')
 * @param formData.secondParent.phone - The phone number of the second parent
 * @param formData.secondParent.type - The type of the second parent ('father', 'mother', or 'guardian')
 * @param parentId - The ID of the parent
 * @returns The newly created student
 */
export async function createOrUpdateStudent(
  formData: {
    firstName: string
    lastName: string
    gender: 'M' | 'F'
    birthDate: string
    address?: string
    idNumber?: string
    avatarUrl?: string
    parentPhone: string
    medicalCondition: { description: string, severity: 'low' | 'medium' | 'high' }[]
    secondParent?: {
      fullName: string
      gender: 'M' | 'F'
      phone: string
      type: 'father' | 'mother' | 'guardian'
    }
  },
): Promise<string> {
  try {
    const client = await createClient()

    // Student exist
    const { data: isExistingStudent } = await client.from('students')
      .select('id, parent_id')
      .eq('id_number', formData.idNumber || '~~~~~')
      .single()

    if (isExistingStudent) {
      const { data: upsertStudent } = await client.from('students')
        .upsert({
          id_number: formData.idNumber!,
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          date_of_birth: formData.birthDate,
          address: formData.address,
          parent_id: isExistingStudent.parent_id,
          parent_phone: `+225${formData.parentPhone}`,
          medical_condition: formData.medicalCondition,
          extra_parent: formData.secondParent
            ? {
                full_name: formData.secondParent.fullName,
                gender: formData.secondParent.gender,
                phone: `+225${formData.secondParent.phone}`,
                type: formData.secondParent.type,
              }
            : null,
        })
        .eq('id', isExistingStudent.id)
        .select('id')
        .single()

      if (upsertStudent) {
        // relink the student to the parent
        linkParentToStudentsByPhone(client, isExistingStudent.id, formData.parentPhone)

        return upsertStudent.id
      }
      else {
        throw new Error('Impossible d\'inscrire l\'élève, réessayer plus tard')
      }
    }

    // Generate a unique student ID
    const { data: lastStudent } = await client.from('students')
      .select('id_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastId = lastStudent?.id_number ? Number.parseInt(lastStudent.id_number.slice(-6)) : 0
    const newIdNumber = formData.idNumber ? formData.idNumber : `ST${(lastId + 1).toString().padStart(6, '0')}`

    // First create the student record
    const { data: studentData, error: studentError } = await client.from('students')
      .insert({
        id_number: newIdNumber,
        first_name: formData.firstName,
        last_name: formData.lastName,
        gender: formData.gender,
        date_of_birth: formData.birthDate,
        address: formData.address,
        parent_id: '46cf18f8-1608-4fac-859b-f6ffb9e2f4ce',
        parent_phone: `+225${formData.parentPhone}`,
        medical_condition: formData.medicalCondition,
        extra_parent: formData.secondParent
          ? {
              full_name: formData.secondParent.fullName,
              gender: formData.secondParent.gender,
              phone: `+225${formData.secondParent.phone}`,
              type: formData.secondParent.type,
            }
          : null,
      })
      .select('id')
      .single()

    if (studentError) {
      console.error('Error creating student:', studentError)
      throw new Error('Impossible d\'inscrire l\'élève, réessayer plus tard')
    }

    // const isBase64 = formData.avatarUrl?.startsWith('data:image')
    // if (isBase64) {
    //   if (!formData.avatarUrl) {
    //     throw new Error('Incorrect avatar')
    //   }
    //   // Process avatar upload and update params with new URL
    //   const newAvatarUrl = await uploadImageToStorage(client, 'student_avatar', studentData.id, formData.avatarUrl)
    //   await client.from('students').update({ avatar_url: newAvatarUrl }).eq('id', studentData.id)
    // }

    await linkParentToStudentsByPhone(client, studentData.id, formData.parentPhone)

    // const medicalCondition = parseMedicalCondition(formData.medicalCondition)

    return studentData.id
  }
  catch (error) {
    console.error('Error in createStudent:', error)
    throw error
  }
}

export async function enrollStudent({
  studentId,
  schoolId,
  gradeId,
  isStateAssigned,
  isOrphan,
  hasCanteenSubscription,
  hasTransportSubscription,
}: {
  studentId: string
  schoolId: string
  gradeId: number
  isStateAssigned: boolean
  isOrphan: boolean
  hasCanteenSubscription: boolean
  hasTransportSubscription: boolean
}): Promise<void> {
  const client = await createClient()

  const { data: schoolYearData, error: schoolYearError } = await client
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (schoolYearError) {
    throw new Error('Impossible de charger l\'année scolaire')
  }

  const { error: enrollmentError } = await client
    .from('student_school_class')
    .insert({
      student_id: studentId,
      school_id: schoolId,
      grade_id: gradeId,
      school_year_id: schoolYearData.id,
      is_government_affected: isStateAssigned,
      is_orphan: isOrphan,
      is_subscribed_to_canteen: hasCanteenSubscription,
      is_subscribed_to_transportation: hasTransportSubscription,
    })

  if (enrollmentError) {
    console.error('Error creating enrollment:', enrollmentError)
    if (enrollmentError.message === 'duplicate key value violates unique constraint "unique_academic_year"') {
      throw new Error('Cet élève est déjà inscrit au cours de cette année scolaire, rendez-vous dans l\'école en question pour d\'ample modification')
    }
    throw new Error('Impossible de créer l\'inscription')
  }
}
