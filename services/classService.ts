'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { ClassDetailsStudent, FilterStudentWhereNotInTheClass, IClass, IClassDetailsStats } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'

interface FetchClassesParams {
  schoolId: string
  page?: number
  limit?: number
  searchTerm?: string
  gradeId?: string
  isActive?: boolean
  hasMainTeacher?: boolean
}

interface CreateClassParams {
  name: string
  schoolId: string
  gradeId: number
  maxStudent: number
}

interface UpdateClassParams {
  classId: string
  name: string
  gradeId: number
  maxStudent: number
}

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
  const { data: user, error } = await client.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

/**
 * Fetches a class by its slug.
 *
 * @param {string} slug - The unique slug identifier for the class
 * @returns {Promise<IClass>} The class matching the slug
 * @throws {Error} If class is not found or if fetch fails
 */
export async function getClassBySlug(slug: string): Promise<IClass> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('classes')
    .select(`
      *,
      teacher_assignments:teacher_class_assignments(
        is_main_teacher,
        teacher:users(
          id,
          first_name,
          last_name,
          email
        )
      )
    `)
    .eq('slug', slug)
    .single()
    .throwOnError()

  if (error) {
    console.error('Error fetching class by slug:', error)
    throw new Error('Failed to fetch class')
  }

  const { count: studentCount, error: studentCountError } = await supabase
    .from('student_school_class')
    .select('class_id', { count: 'exact' })
    .eq('class_id', data.id)
    .eq('enrollment_status', 'accepted')
    .is('is_active', true)
    .throwOnError()

  if (studentCountError) {
    console.error('Error fetching class students count:', studentCountError)
    throw new Error('Failed to count students of the class')
  }

  if (!data) {
    throw new Error('Class not found')
  }

  // Find the main teacher assignment
  const mainTeacherAssignment = data.teacher_assignments?.find(ta => ta.is_main_teacher)
  const mainTeacher = mainTeacherAssignment?.teacher

  return {
    id: data.id,
    name: data.name,
    slug: data.slug!,
    gradeId: data.grade_id,
    isActive: data.is_active,
    maxStudent: data.max_student,
    studentCount: studentCount ?? 0,
    teacher: mainTeacher
      ? {
          id: mainTeacher.id,
          fullName: formatFullName(mainTeacher.first_name, mainTeacher.last_name, mainTeacher.email),
        }
      : null,
  }
}

/**
 * Fetches paginated classes with optional filters.
 *
 * @param {FetchClassesParams} params - Parameters for fetching classes
 * @returns {Promise<IClass[]>} Paginated classes and total count
 * @throws {Error} If user is not authenticated or if fetch fails
 */
export async function fetchClasses({
  schoolId,
  page = 1,
  limit = 10,
  searchTerm = '',
  gradeId,
  isActive,
  hasMainTeacher,
}: FetchClassesParams): Promise<{ classes: IClass[], totalCount: number }> {
  const supabase = await createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  // Base query without teacher filter
  let query = supabase
    .from('classes')
    .select(`
      *,
      student_school_class(count),
      teacher_assignments:teacher_class_assignments(
        is_main_teacher,
        teacher:users(
          id,
          first_name,
          last_name,
          email
        )
      )
    `, { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('student_school_class.is_active', true)

  // Apply optional filters
  if (gradeId) {
    query = query.eq('grade_id', Number.parseInt(gradeId))
  }

  if (typeof isActive === 'boolean') {
    query = query.eq('is_active', isActive)
  }

  if (typeof hasMainTeacher === 'boolean') {
    if (hasMainTeacher) {
      // Classes with main teacher
      query = query
        .not('teacher_assignments', 'is', null)
        .is('teacher_assignments.is_main_teacher', true)
    }
    else {
      // Classes without main teacher - using exists check
      query = query
        // TODO: show only classes without main teacher
        .not('teacher_assignments.is_main_teacher', 'is', true)
    }
  }

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`)
  }

  const { data, count, error } = await query
    .range(from, to)
    .order('grade_id', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching classes:', error)
    throw new Error('Failed to fetch classes')
  }

  const classes = data?.map((c) => {
    // Find the main teacher assignment
    const mainTeacherAssignment = c.teacher_assignments?.find(ta => ta.is_main_teacher)
    const mainTeacher = mainTeacherAssignment?.teacher

    return {
      id: c.id,
      name: c.name,
      slug: c.slug!,
      gradeId: c.grade_id,
      isActive: c.is_active,
      maxStudent: c.max_student,
      studentCount: (c.student_school_class as any)?.[0]?.count ?? 0,
      teacher: mainTeacher
        ? {
            id: mainTeacher.id,
            fullName: formatFullName(mainTeacher.first_name, mainTeacher.last_name, mainTeacher.email),
          }
        : null,
    } satisfies IClass
  }) ?? []

  return { classes, totalCount: count ?? 0 }
}

/**
 * Creates a new class in the specified school.
 *
 * @param {CreateClassParams} params - Parameters for creating a class
 * @returns {Promise<IClass>} The created class
 * @throws {Error} If user is not authenticated or if creation fails
 */
export async function createClass({
  name,
  schoolId,
  gradeId,
  maxStudent,
}: CreateClassParams): Promise<IClass> {
  const supabase = await createClient()

  // Validate inputs
  if (!name.trim()) {
    throw new Error('Le nom de la classe est requis')
  }
  if (!schoolId) {
    throw new Error('École non trouvée')
  }
  if (!gradeId) {
    throw new Error('Niveau scolaire requis')
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({
      name: name.trim(),
      school_id: schoolId,
      grade_id: gradeId,
      max_student: maxStudent,
    })
    .select('*')
    .single()
    .throwOnError()

  if (error) {
    console.error('Error creating class:', error)
    throw new Error('Échec de la création de la classe')
  }

  if (!data) {
    throw new Error('Échec de la création de la classe')
  }

  return {
    id: data.id,
    teacher: null,
    studentCount: 0,
    name: data.name,
    slug: data.slug!,
    gradeId: data.grade_id,
    isActive: data.is_active,
    maxStudent: data.max_student,
  }
}

/**
 * Updates an existing class.
 *
 * @param {UpdateClassParams} params - Parameters for updating the class
 * @returns {Promise<IClass>} The updated class
 * @throws {Error} If user is not authenticated or if update fails
 */
export async function updateClass({
  classId,
  name,
  gradeId,
  maxStudent,
}: UpdateClassParams): Promise<IClass> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate inputs
  if (!name.trim()) {
    throw new Error('Le nom de la classe est requis')
  }
  if (!classId) {
    throw new Error('Classe non trouvée')
  }
  if (!gradeId) {
    throw new Error('Niveau scolaire requis')
  }

  const { count: studentCount, error: studentCountError } = await supabase
    .from('student_school_class')
    .select('id', { count: 'exact' })
    .eq('class_id', classId)
    .is('is_active', true)

  if (studentCountError) {
    throw studentCountError
  }

  if (maxStudent <= (studentCount ?? 0)) {
    throw new Error('Cette classe contient plus d\'élève que la limite')
  }

  // First, update the class
  const { data: classData, error: updateError } = await supabase
    .from('classes')
    .update({
      name: name.trim(),
      grade_id: gradeId,
      max_student: maxStudent,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq('id', classId)
    .select('*')
    .single()
    .throwOnError()

  if (updateError) {
    console.error('Error updating class:', updateError)
    throw new Error('Échec de la modification de la classe')
  }

  if (!classData) {
    throw new Error('Classe non trouvée')
  }

  const [teacherResult, countResult] = await Promise.allSettled([
    // Get the main teacher for this class
    supabase
      .from('teacher_class_assignments')
      .select(`
        users!inner(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('class_id', classId)
      .eq('is_main_teacher', true)
      .single(),

    // Get student count
    supabase
      .from('student_school_class')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId)
      .is('is_active', true),
  ])

  // Handle teacher result
  let teacherAssignment = null
  if (teacherResult.status === 'fulfilled' && teacherResult.value.error?.code !== 'PGRST116') {
    if (teacherResult.value.error) {
      console.error('Error fetching teacher:', teacherResult.value.error)
    }
    else {
      teacherAssignment = teacherResult.value.data
    }
  }

  // Handle count result
  let studentCountResult = 0
  if (countResult.status === 'fulfilled') {
    if (countResult.value.error) {
      console.error('Error fetching student count:', countResult.value.error)
    }
    else {
      studentCountResult = countResult.value.count ?? 0
    }
  }

  return {
    id: classData.id,
    name: classData.name,
    slug: classData.slug!,
    gradeId: classData.grade_id,
    isActive: classData.is_active,
    maxStudent: classData.max_student,
    studentCount: studentCountResult ?? 0,
    teacher: teacherAssignment?.users
      ? {
          id: teacherAssignment.users.id,
          fullName: formatFullName(
            teacherAssignment.users.first_name,
            teacherAssignment.users.last_name,
            teacherAssignment.users.email,
          ),
        }
      : null,
  }
}

export async function activateDeactivateClass(classId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('classes')
    .update({ is_active: isActive })
    .eq('id', classId)
    .throwOnError()

  if (error) {
    console.error('Error updating class:', error)
    throw new Error('Échec de la modification de la classe')
  }
}

export async function deleteClass(schoolId: string, classId: string): Promise<void> {
  const supabase = await createClient()

  // check first if class contains students
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id')
    .eq('class_id', classId)
    .limit(1)

  if (studentError) {
    throw new Error('Nous n\'avons pas pu supprimer la classe, réessayez plus tard.')
  }

  if (students.length) {
    throw new Error('Vous ne pouvez pas supprimer une classe avec des élèves.')
  }

  const { data, error } = await supabase
    .from('classes')
    .delete()
    .eq('school_id', schoolId)
    .eq('id', classId)
    .select('*, teacher:users(id, first_name, last_name, email)')
    .single()
    .throwOnError()

  if (error) {
    console.error('Error deleting class:', error)
    throw new Error('Échec de la suppression de la classe')
  }

  if (!data) {
    throw new Error('Classe non trouvée')
  }
}

interface GetClassStatsProps {
  schoolId: string
  classId: string
  schoolYearId: number
  semesterId?: number
}

/**
 * Retrieves class statistics based on the provided parameters.
 * @async
 * @param {GetClassStatsProps} props - The parameters to fetch class statistics.
 * @param {string} props.schoolId - The ID of the school.
 * @param {string} props.classId - The ID of the class.
 * @param {number} [props.schoolYearId] - The ID of the school year (optional).
 * @param {number} [props.semesterId] - The ID of the semester (optional).
 * @returns {Promise<IClassDetailsStats>} A promise that resolves to the class metrics data.
 * @throws {Error} If the user is unauthorized or if there is an error fetching data.
 */
export async function getClassDetailsStats({ schoolId, classId, schoolYearId, semesterId }: GetClassStatsProps): Promise<IClassDetailsStats> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get basic student counts
  const studentCountsQs = supabase
    .from('students')
    .select('id, gender, student_enrollment_view!inner(school_id, class_id, enrollment_status)')
    .eq('student_enrollment_view.class_id', classId)
    .eq('student_enrollment_view.school_id', schoolId)

  // Get attendance statistics
  let attendanceQs = supabase
    .from('attendances')
    .select('status, created_date')
    .eq('class_id', classId)
    .eq('school_years_id', schoolYearId)
    .is('is_excused', false)

  if (semesterId) {
    attendanceQs = attendanceQs.eq('semesters_id', semesterId)
  }

  // Get grades and calculate average
  const classAverageQs = supabase
    .from('class_year_average_view')
    .select('year_average')
    .eq('class_id', classId)
    .eq('school_year_id', schoolYearId)
    .single()

  const [
    { data: studentCounts },
    { data: attendanceData },
    { data: classAverage },
  ] = await Promise.all([
    studentCountsQs,
    attendanceQs,
    classAverageQs,
  ])

  const totalStudents = studentCounts?.length ?? 0
  const boyCount = studentCounts?.filter(s => s.gender === 'M').length ?? 0
  const girlCount = studentCounts?.filter(s => s.gender === 'F').length ?? 0
  const activeStudents = totalStudents // You might need to add an is_active column to students table
  const inactiveStudents = 0 // Same as above

  const absentCount = attendanceData?.filter(a => a.status === 'absent').length ?? 0
  const lateCount = attendanceData?.filter(a => a.status === 'late').length ?? 0

  // // Calculate subject performance
  // const subjectPerformance = Object.values(
  //   gradeData.reduce((acc: { [key: string]: { subject: string, grades: number[], highest: number, lowest: number } }, curr) => {
  //     const subjectId = curr.notes.subject_id
  //     const percentage = ((curr.note ?? 0) / curr.notes.total_points) * 100

  //     if (!acc[subjectId]) {
  //       acc[subjectId] = {
  //         subject: subjectId,
  //         grades: [],
  //         highest: percentage,
  //         lowest: percentage,
  //       }
  //     }

  //     acc[subjectId].grades.push(percentage)
  //     acc[subjectId].highest = Math.max(acc[subjectId].highest, percentage)
  //     acc[subjectId].lowest = Math.min(acc[subjectId].lowest, percentage)

  //     return acc
  //   }, {}),
  // ).map(({ subject, grades, highest, lowest }) => ({
  //   subject,
  //   average: Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)),
  //   highest: Number(highest.toFixed(2)),
  //   lowest: Number(lowest.toFixed(2)),
  // }))

  return {
    totalStudents,
    averageGrade: classAverage?.year_average ?? 0,
    absentCount,
    lateCount,
    boyCount,
    girlCount,
    activeStudents,
    inactiveStudents,
    performanceData: [], // TODO: Implement performance data
    subjectPerformance: [], // TODO: Implement subject performance
  }
}

interface GetClassStudentsProps {
  classId: string
  page: number
  limit: number
  schoolYearId: number
  semesterId: number
}

/**
 * Retrieves the students of a class based on the provided parameters.
 * @async
 * @param {GetClassStudentsProps} props - The parameters to fetch class students.
 * @param {string} props.schoolId - The ID of the school.
 * @param {string} props.classId - The ID of the class.
 * @param {number} props.page - The page number.
 * @param {number} props.limit - The number of items per page.
 * @returns {Promise<ClassDetailsStudent[]>} A promise that resolves to an array of class student data.
 * @throws {Error} If the user is unauthorized or if there is an error fetching data.
 */
export async function getClassStudents({
  classId,
  page,
  limit,
  schoolYearId,
  semesterId,
}: GetClassStudentsProps): Promise<{ students: ClassDetailsStudent[], totalCount: number }> {
  const supabase = await createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  await checkAuthUserId(supabase)

  // Fetch student data using the new student_semester_average_view
  const { data: studentData, error, count: totalCount } = await supabase
    .from('student_semester_average_view')
    .select(`
      student:students!inner (
        id,
        id_number,
        first_name,
        last_name,
        gender,
        date_of_birth,
        avatar_url,
        address,
        parent:users(id, first_name, last_name, email, phone, avatar_url),
        student_enrollment_view!inner(school_id, class_id, enrollment_status, created_at, is_government_affected, class_name),
        attendances(
          status,
          class_id,
          is_excused,
          created_at,
          school_years_id,
          semesters_id
        )
      ),
      semester_average,
      rank_in_class,
      class_id,
      school_year_id,
      semester_id
    `, { count: 'exact' })
    .eq('class_id', classId)
    .eq('school_year_id', schoolYearId)
    .eq('semester_id', semesterId)
    .range(from, to)
    .order('rank_in_class', { ascending: true, nullsFirst: false })
    .throwOnError()

  if (error) {
    console.error('Error fetching class students with rank:', error)
    throw new Error('Failed to fetch students')
  }

  if (!studentData) {
    throw new Error('Failed to fetch students data')
  }

  // Process each student's data to match the interface
  const students = studentData.map((item) => {
    const student = item.student // Access nested student object

    if (!student) {
      // Handle cases where the join might unexpectedly fail, though !inner should prevent this
      console.warn(`Student data missing for rank entry: ${JSON.stringify(item)}`)
      return null // Or throw an error, or return a default structure
    }

    // Filter attendance for current school year and semester
    const currentAttendance = student.attendances.filter(attendance =>
      attendance.school_years_id === schoolYearId
      && attendance.semesters_id === semesterId
      && attendance.class_id === classId
      && attendance.is_excused === false,
    )

    // Count absences and lates
    const absentCount = currentAttendance.filter(a => a.status === 'absent').length
    const lateCount = currentAttendance.filter(a => a.status === 'late').length

    // Get last evaluation date from attendance (best effort)
    const validAttendances = currentAttendance.filter(a => a.created_at !== null)

    const lastEvaluation = validAttendances.length > 0
      ? new Date(Math.max(...validAttendances.map(a =>
          // We know a.created_at is not null here due to the filter above
          new Date(a.created_at!).getTime(),
        ))).toLocaleDateString()
      : ''

    const enrollment: typeof student.student_enrollment_view[0] = student.student_enrollment_view.length > 0
      ? student.student_enrollment_view[0]
      : { school_id: null, class_id: null, enrollment_status: null, created_at: null, is_government_affected: null, class_name: null }

    // Use semester_average and rank_in_class from the view
    const gradeAverage = item.semester_average ?? 0
    const rank = item.rank_in_class ?? 0

    const parent = student.parent as any

    return {
      id: student.id,
      idNumber: student.id_number,
      firstName: student.first_name,
      lastName: student.last_name,
      gender: (student.gender || 'M') as 'M' | 'F',
      birthDate: student.date_of_birth,
      avatarUrl: student.avatar_url,
      address: student.address,
      classId: enrollment.class_id,
      className: enrollment.class_name,
      dateJoined: enrollment.created_at,
      isGouvernentAffected: enrollment.is_government_affected || false,
      isOrphan: false,
      hasSubscribedTransportationService: false,
      hasSubscribedCanteenService: false,
      gradeAverage,
      absentCount,
      lateCount,
      lastEvaluation,
      teacherNotes: '', // TODO: Placeholder
      status: 'active', // TODO: Placeholder
      rank,
      parent: parent
        ? {
            id: parent.id,
            fullName: formatFullName(parent.first_name, parent.last_name, parent.email),
            email: parent.email,
            phone: parent.phone ?? 'N/A',
            avatarUrl: parent.avatar_url ?? null,
          }
        : undefined,
    }
  }).filter(s => s !== null) as ClassDetailsStudent[] // Filter out any nulls if handled that way

  // No need for manual sorting/ranking anymore

  return { students, totalCount: totalCount ?? 0 }
}

export async function filterStudentWhereNotInTheClass(
  schoolId: string,
  classId: string,
  search?: string,
): Promise<FilterStudentWhereNotInTheClass[]> {
  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select(`
      id, id_number, first_name, last_name, avatar_url,
      enrollment:student_school_class!inner(classroom:classes!inner(id, name, school_id))
      `,
    )
    .eq('enrollment.classroom.school_id', schoolId)
    .neq('enrollment.classroom.id', classId)

  if (search) {
    const searchConditions = [
      `id_number.ilike.%${search}%`,
      `first_name.ilike.%${search}%`,
      `last_name.ilike.%${search}%`,
    ]

    query = query.or(searchConditions.join(','))
  }

  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .limit(5)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching students:', error)
    throw new Error(`Error fetching students: ${error.message}`)
  }

  const parsedData = data.map(d => ({
    idNumber: d.id_number,
    fullName: formatFullName(d.first_name, d.last_name),
    currentClass: (d.enrollment as any).classroom
      ? {
          id: (d.enrollment as any).classroom.id,
          name: (d.enrollment as any).classroom.name,
        }
      : null,
    imageUrl: d.avatar_url,
  }))

  return parsedData
}

export async function getClasses(_schoolId: string, _schoolYearId: string) {
  // TODO: Implement this function
  return []
}
