'use server'

import type { ClassDetailsStudent, IClass, IClassDetailsStats } from '@/types'
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
    .select('*, students(count), teacher:users(id, first_name, last_name, email)', { count: 'exact' })
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
      studentCount: (c.students[0] as any)?.count ?? 0,
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

interface GetClassStatsProps {
  schoolId: string
  classId: string
  schoolYearId?: number
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

  const { data: classMetrics, error } = await supabase
    .rpc('get_class_metrics', {
      p_school_id: schoolId,
      p_class_id: classId,
      p_school_year_id: schoolYearId,
      p_semester_id: semesterId,
    })
    .single()
    .throwOnError()

  if (error) {
    console.error('Error fetching class metrics:', error)
    throw new Error('Failed to fetch class metrics')
  }

  return {
    totalStudents: classMetrics.total_students,
    lateRate: classMetrics.late_rate,
    absentRate: classMetrics.absent_rate,
    averageGrade: classMetrics.average_grade,
  }
}

interface GetClassStudentsProps {
  schoolId: string
  classId: string
  page: number
  limit: number
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
export async function getClassStudents({ schoolId, classId, page, limit }: GetClassStudentsProps): Promise<{ students: ClassDetailsStudent[], totalCount: number }> {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const { data, count, error } = await supabase
    .from('students')
    // TODO: improve this query with gradeAverage, ...
    .select('id, first_name, last_name, id_number', { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('class_id', classId)
    .range(from, to)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .throwOnError()

  if (error) {
    console.error('Error fetching class students:', error)
    throw new Error('Failed to fetch class students')
  }

  return {
    totalCount: count ?? 0,
    students: data.map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      idNumber: student.id_number,

      // TODO: Make these properties dynamic
      gradeAverage: 0,
      lateCount: 0,
      absentCount: 0,
    })),
  }
}
