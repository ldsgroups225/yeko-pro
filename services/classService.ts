'use server'

import type { ClassDetailsStudent, FilterStudentWhereNotInTheClass, IClass, IClassDetailsStats } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { getUserId } from './userService'

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
}

interface UpdateClassParams {
  classId: string
  name: string
  gradeId: number
}

/**
 * Fetches a class by its slug.
 *
 * @param {string} slug - The unique slug identifier for the class
 * @returns {Promise<IClass>} The class matching the slug
 * @throws {Error} If class is not found or if fetch fails
 */
export async function getClassBySlug(slug: string): Promise<IClass> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('classes')
    .select('*, students(count), teacher:users(id, first_name, last_name, email)')
    .eq('slug', slug)
    .single()
    .throwOnError()

  if (error) {
    console.error('Error fetching class by slug:', error)
    throw new Error('Failed to fetch class')
  }

  if (!data) {
    throw new Error('Class not found')
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug!,
    gradeId: data.grade_id,
    isActive: data.is_active,
    studentCount: (data.students[0] as any)?.count ?? 0,
    teacher: data.teacher
      ? {
          id: data.teacher.id,
          fullName: formatFullName(data.teacher.first_name, data.teacher.last_name, data.teacher.email),
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
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('classes')
    .select('*, student_enrollment_view(count), teacher:users(id, first_name, last_name, email)', { count: 'exact' })
    .eq('school_id', schoolId)

  // Apply optional filters
  if (gradeId) {
    query = query.eq('grade_id', Number.parseInt(gradeId))
  }

  if (typeof isActive === 'boolean') {
    query = query.eq('is_active', isActive)
  }

  if (typeof hasMainTeacher === 'boolean') {
    query = hasMainTeacher
      ? query.not('main_teacher_id', 'is', null)
      : query.is('main_teacher_id', null)
  }

  if (searchTerm) {
    query = query.ilike('name', `%${searchTerm}%`)
  }

  const { data, count, error } = await query
    .range(from, to)
    .order('grade_id', { ascending: true })
    .order('name', { ascending: true })
    .throwOnError()

  if (error) {
    console.error('Error fetching classes:', error)
    throw new Error('Failed to fetch classes')
  }

  const classes = data?.map((c) => {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug!,
      gradeId: c.grade_id,
      isActive: c.is_active,
      studentCount: (c.student_enrollment_view[0] as any)?.count ?? 0,
      teacher: c.teacher
        ? {
            id: c.teacher.id,
            fullName: formatFullName(c.teacher.first_name, c.teacher.last_name, c.teacher.email),
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
}: CreateClassParams): Promise<IClass> {
  const supabase = createClient()

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
    name: data.name,
    slug: data.slug!,
    gradeId: data.grade_id,
    isActive: data.is_active,
    studentCount: 0,
    teacher: null,
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
}: UpdateClassParams): Promise<IClass> {
  const supabase = createClient()

  const userId = await getUserId()
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

  const { data, error } = await supabase
    .from('classes')
    .update({
      name: name.trim(),
      grade_id: gradeId,
    })
    .eq('id', classId)
    .select('*, teacher:users(id, first_name, last_name, email), students(count)')
    .single()
    .throwOnError()

  if (error) {
    console.error('Error updating class:', error)
    throw new Error('Échec de la modification de la classe')
  }

  if (!data) {
    throw new Error('Classe non trouvée')
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug!,
    gradeId: data.grade_id,
    isActive: data.is_active,
    studentCount: (data.students[0] as any)?.count ?? 0,
    teacher: data.teacher
      ? {
          id: data.teacher.id,
          fullName: formatFullName(data.teacher.first_name, data.teacher.last_name, data.teacher.email),
        }
      : null,
  }
}

export async function activateDeactivateClass(classId: string, isActive: boolean) {
  const supabase = createClient()

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
  const supabase = createClient()

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
  const supabase = createClient()

  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get basic student counts
  const { data: studentCounts } = await supabase
    .from('students')
    .select('id, gender, student_enrollment_view!inner(school_id, class_id, enrollment_status)')
    .eq('student_enrollment_view.class_id', classId)
    .eq('student_enrollment_view.school_id', schoolId)

  if (!studentCounts) {
    throw new Error('Failed to fetch student data')
  }

  const totalStudents = studentCounts.length
  const boyCount = studentCounts.filter(s => s.gender === 'M').length
  const girlCount = studentCounts.filter(s => s.gender === 'F').length
  const activeStudents = totalStudents // You might need to add an is_active column to students table
  const inactiveStudents = 0 // Same as above

  // Get attendance statistics
  let attendanceQs = supabase
    .from('attendances')
    .select('status, created_date')
    .eq('class_id', classId)
    .eq('school_years_id', schoolYearId)

  if (semesterId) {
    attendanceQs = attendanceQs.eq('semesters_id', semesterId)
  }

  const { data: attendanceData } = await attendanceQs

  if (!attendanceData) {
    throw new Error('Failed to fetch attendance data')
  }

  const totalAttendances = attendanceData.length
  const absentCount = attendanceData.filter(a => a.status === 'absent').length
  const lateCount = attendanceData.filter(a => a.status === 'late').length

  const absentRate = totalAttendances ? (absentCount / totalAttendances) * 100 : 0
  const lateRate = totalAttendances ? (lateCount / totalAttendances) * 100 : 0

  // Get grades and calculate average
  let gradeQs = supabase
    .from('note_details')
    .select(`
    note,
    notes!inner (
      subject_id,
      created_at,
      total_points
      )
    `)
    .eq('notes.class_id', classId)
    .eq('notes.school_year_id', schoolYearId)
    .eq('notes.is_graded', true)

  if (semesterId) {
    gradeQs = gradeQs.eq('notes.semester_id', semesterId)
  }

  const { data: gradeData } = await gradeQs

  if (!gradeData) {
    throw new Error('Failed to fetch grade data')
  }

  // Calculate overall average grade
  const averageGrade = gradeData.length > 0
    ? gradeData.reduce((acc, curr) => {
      const percentage = ((curr.note ?? 0) / curr.notes.total_points) * 100
      return acc + percentage
    }, 0) / gradeData.length
    : 0

  // Calculate performance data by month
  const performanceData = Object.values(
    gradeData.reduce((acc: { [key: string]: { month: string, average: number, count: number, attendance: number } }, curr) => {
      const month = new Date(curr.notes.created_at).toLocaleString('default', { month: 'long' })

      if (!acc[month]) {
        acc[month] = { month, average: 0, count: 0, attendance: 0 }
      }

      const percentage = ((curr.note ?? 0) / curr.notes.total_points) * 100
      acc[month].average = ((acc[month].average * acc[month].count) + percentage) / (acc[month].count + 1)
      acc[month].count++

      return acc
    }, {}),
  ).map(({ month, average, attendance }) => ({
    month,
    average: Number(average.toFixed(2)),
    attendance: Number(attendance.toFixed(2)),
  }))

  // Calculate subject performance
  const subjectPerformance = Object.values(
    gradeData.reduce((acc: { [key: string]: { subject: string, grades: number[], highest: number, lowest: number } }, curr) => {
      const subjectId = curr.notes.subject_id
      const percentage = ((curr.note ?? 0) / curr.notes.total_points) * 100

      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: subjectId,
          grades: [],
          highest: percentage,
          lowest: percentage,
        }
      }

      acc[subjectId].grades.push(percentage)
      acc[subjectId].highest = Math.max(acc[subjectId].highest, percentage)
      acc[subjectId].lowest = Math.min(acc[subjectId].lowest, percentage)

      return acc
    }, {}),
  ).map(({ subject, grades, highest, lowest }) => ({
    subject,
    average: Number((grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2)),
    highest: Number(highest.toFixed(2)),
    lowest: Number(lowest.toFixed(2)),
  }))

  return {
    totalStudents,
    averageGrade: Number(averageGrade.toFixed(2)),
    absentRate: Number(absentRate.toFixed(2)),
    lateRate: Number(lateRate.toFixed(2)),
    boyCount,
    girlCount,
    activeStudents,
    inactiveStudents,
    performanceData,
    subjectPerformance,
  }
}

interface GetClassStudentsProps {
  schoolId: string
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
  schoolId,
  classId,
  page,
  limit,
  schoolYearId,
  semesterId,
}: GetClassStudentsProps): Promise<{ students: ClassDetailsStudent[], totalCount: number }> {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // First, get all students in the class
  const { data: students, error: studentError, count: studentCount } = await supabase
    .from('students')
    .select(`
      id,
      id_number,
      first_name,
      last_name,
      student_enrollment_view!inner(school_id, class_id, enrollment_status),
      note_details(
        note,
        notes!inner (
          total_points,
          school_year_id,
          semester_id,
          created_at
        )
      ),
      attendances(
        status,
        created_at,
        school_years_id,
        semesters_id
      )
    `, { count: 'exact' })
    .eq('student_enrollment_view.class_id', classId)
    .eq('student_enrollment_view.school_id', schoolId)
    .range(from, to)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .throwOnError()

  if (studentError) {
    throw new Error('Failed to fetch students')
  }

  if (!students) {
    throw new Error('Failed to fetch students data')
  }

  // Process each student's data to match the interface
  const studentsWithStats = students.map((student) => {
    // Filter grades for current school year and semester
    const currentGrades = student.note_details.filter(detail =>
      detail.notes.school_year_id === schoolYearId
      && detail.notes.semester_id === semesterId,
    )

    // Calculate grade average
    const gradeAverage = currentGrades.length > 0
      ? currentGrades.reduce((acc, curr) => {
        const percentage = ((curr.note ?? 0) / curr.notes.total_points) * 100
        return acc + percentage
      }, 0) / currentGrades.length
      : 0

    // Get last evaluation date
    const lastEvaluation = currentGrades.length > 0
      ? new Date(Math.max(...currentGrades.map(g =>
          new Date(g.notes.created_at).getTime(),
        ))).toLocaleDateString()
      : ''

    // Filter attendance for current school year and semester
    const currentAttendance = student.attendances.filter(attendance =>
      attendance.school_years_id === schoolYearId
      && attendance.semesters_id === semesterId,
    )

    // Count absences and lates
    const absentCount = currentAttendance.filter(a => a.status === 'absent').length
    const lateCount = currentAttendance.filter(a => a.status === 'late').length

    return {
      id: student.id,
      idNumber: student.id_number,
      firstName: student.first_name,
      lastName: student.last_name,
      gradeAverage: Number(gradeAverage.toFixed(2)),
      absentCount,
      lateCount,
      lastEvaluation,
      teacherNotes: '', // You might want to add a notes table/column
      status: 'active', // You might want to add a status column
      rank: 0, // Will be calculated after sorting
    }
  })

  // Sort by grade average and assign ranks
  const sortedStudents = studentsWithStats
    .sort((a, b) => b.gradeAverage - a.gradeAverage)
    .map((student, index) => ({
      ...student,
      rank: index + 1,
    }))

  return { students: sortedStudents, totalCount: studentCount ?? 0 }
}

export async function filterStudentWhereNotInTheClass(
  schoolId: string,
  classId: string,
  search?: string,
): Promise<FilterStudentWhereNotInTheClass[]> {
  const supabase = createClient()

  let query = supabase
    .from('students')
    .select('id, id_number, first_name, last_name, avatar_url, classroom:classes!inner(id, name, school_id)')
    .eq('classroom.school_id', schoolId)
    .neq('class_id', classId)

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
    currentClass: d.classroom
      ? {
          id: d.classroom.id,
          name: d.classroom.name,
        }
      : null,
    imageUrl: d.avatar_url,
  }))

  return parsedData
}
