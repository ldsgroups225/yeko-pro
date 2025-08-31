'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { ITeacherDTO, ITeacherOptions, ITeacherQueryParams } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'

async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error } = await client
    .from('user_roles')
    .select('school_id')
    .eq('user_id', userId)
    .eq('role_id', ERole.DIRECTOR)
    .single()
  if (error || !userSchool?.school_id) {
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }
  return userSchool.school_id
}

export async function getTeachers(query: ITeacherQueryParams): Promise<{ data: ITeacherDTO[], totalCount: number | null }> {
  const supabase = await createClient()
  const _page = query.page ?? 1
  const _limit = query.limit ?? 10

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  const from = (_page - 1) * _limit
  const to = from + _limit - 1

  // Base query
  let supabaseQuery = supabase
    .from('schools_teachers')
    .select(`
      teacher_id,
      status,
      teacher:users!teacher_id (
        id, 
        email, 
        first_name, 
        last_name, 
        phone, 
        avatar_url,
        teacher_assignments:teacher_class_assignments(
          id,
          is_main_teacher,
          class:classes(id, name),
          subject:subjects(id, name)
        )
      )
    `, { count: 'exact' })
    .eq('school_id', schoolId)

  // Search term filtering
  if (query.searchTerm) {
    supabaseQuery = supabaseQuery.or(
      `first_name.ilike.%${query.searchTerm}%,`
      + `last_name.ilike.%${query.searchTerm}%,`
      + `email.ilike.%${query.searchTerm}%`,
      { foreignTable: 'teacher' },
    )
  }

  // Status filtering
  if (query.status) {
    supabaseQuery = supabaseQuery.eq('status', query.status)
  }

  // Selected classes filtering
  if (query.selectedClasses?.length) {
    supabaseQuery = supabaseQuery.in('teacher_assignments.class.id', query.selectedClasses)
  }

  // Selected subjects filtering
  if (query.selectedSubjects?.length) {
    supabaseQuery = supabaseQuery.in('teacher_assignments.subject.id', query.selectedSubjects)
  }

  // Sorting
  if (query.sort?.column) {
    const column = query.sort.column === 'lastName' ? 'last_name' : query.sort.column
    supabaseQuery = supabaseQuery.order(
      column,
      {
        ascending: query.sort.direction === 'asc',
        referencedTable: 'teacher',
      },
    )
  }

  // Execute the query
  const { data, count, error } = await supabaseQuery
    .range(from, to)
    .order('status', { ascending: false })
    .order('last_name', { ascending: true, referencedTable: 'teacher' })

  if (error)
    throw error

  return {
    data: data?.map((record) => {
      const teacher = record.teacher
      return {
        id: teacher.id,
        email: teacher.email,
        firstName: teacher.first_name!,
        lastName: teacher.last_name!,
        phone: teacher.phone!,
        avatarUrl: teacher.avatar_url ?? '',
        status: record.status,
        assignments: teacher.teacher_assignments?.map(assignment => ({
          id: assignment.id,
          classId: assignment.class.id,
          className: assignment.class.name,
          subjectId: assignment.subject.id,
          subjectName: assignment.subject.name,
          isMainTeacher: assignment.is_main_teacher,
        })) ?? [],
      }
    }) ?? [],
    totalCount: count,
  }
}

export async function updateTeacherStatus(
  teacherId: string,
  schoolId: string,
  status: 'pending' | 'accepted' | 'rejected',
): Promise<void> {
  const client = await createClient()
  const { error } = await client
    .from('schools_teachers')
    .update({ status })
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId)

  if (error)
    throw error
}

export async function updateTeacherAssignments(
  teacherId: string,
  assignments: Array<{
    classId: string
    subjectId: string
    isMainTeacher: boolean
  }>,
): Promise<void> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  // Supprimer les affectations existantes
  const { error: deleteError } = await supabase
    .from('teacher_class_assignments')
    .delete()
    .eq('school_id', schoolId)
    .eq('teacher_id', teacherId)

  if (deleteError) {
    throw deleteError
  }

  // Insérer les nouvelles affectations
  const { error: insertError } = await supabase
    .from('teacher_class_assignments')
    .insert(
      assignments.map(assignment => ({
        teacher_id: teacherId,
        school_id: schoolId,
        class_id: assignment.classId,
        subject_id: assignment.subjectId,
        is_main_teacher: assignment.isMainTeacher,
      })),
    )

  if (insertError) {
    throw insertError
  }
}

export async function createInviteTeacher(): Promise<string> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  const { data, error } = await supabase
    .rpc('generate_invite_teacher_otp', { p_school_id: schoolId })

  if (error) {
    console.error('Error creating invite:', error)
    throw new Error('Failed to create invite')
  }

  if (data.length === 0) {
    console.error('No data returned from the RPC call')
    throw new Error('Failed to create invite')
  }

  return data
}

export async function getTeacherToSetToCourse(
  schoolId: string,
  search?: string,
): Promise<ITeacherOptions[]> {
  const client = await createClient()

  let supabaseQuery = client
    .from('schools_teachers')
    .select('teacher:users!teacher_id (id, first_name, last_name, email)')
    .eq('school_id', schoolId)
    .eq('status', 'accepted')

  if (search) {
    const trimmedSearch = search.trim()
    if (trimmedSearch) {
      const escapedSearch = trimmedSearch.replace(/'/g, '\'\'')
      const searchPattern = `'%${escapedSearch}%'`

      supabaseQuery = supabaseQuery.or(
        `first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},email.ilike.${searchPattern}`,
        { foreignTable: 'teacher' },
      )
    }
  }

  const { data, error } = await supabaseQuery
    .order('last_name', { ascending: true, foreignTable: 'teacher' })
    .order('first_name', { ascending: true, foreignTable: 'teacher' })

  if (error) {
    throw error
  }

  const teachers = data.map(t => ({
    id: t.teacher.id,
    name: formatFullName(
      t.teacher.first_name,
      t.teacher.last_name,
      t.teacher.email,
    ),
  }))

  return teachers
}
