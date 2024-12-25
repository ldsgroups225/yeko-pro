'use server'

import type { IClass } from '@/types'
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
  searchTerm = '3',
  gradeId,
  isActive,
  hasMainTeacher,
}: FetchClassesParams): Promise<IClass[]> {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('classes')
    .select('*, students(count), teacher:users(id, first_name, last_name, email)', { count: 'exact' })
    .eq('school_id', schoolId)

  // Apply optional filters
  if (gradeId) {
    query = query.eq('grade_id', gradeId)
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

  const { data, error } = await query
    .range(from, to)
    .order('grade_id', { ascending: true })
    .throwOnError()

  if (error) {
    console.error('Error fetching classes:', error)
    throw new Error('Failed to fetch classes')
  }

  return data?.map((c) => {
    return {
      id: c.id,
      name: c.name,
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
