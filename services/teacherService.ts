'use server'

import type { ITeacherDTO, ITeacherQueryParams } from '@/types'
import { createClient } from '@/lib/supabase/server'

export async function getTeachers(query: ITeacherQueryParams): Promise<{ data: ITeacherDTO[], totalCount: number | null }> {
  const client = createClient()
  const _page = query.page ?? 1
  const _limit = query.limit ?? 10

  const from = (_page - 1) * _limit
  const to = from + _limit - 1

  // Base query
  let supabaseQuery = client
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
    .eq('school_id', query.schoolId!)

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
    supabaseQuery = supabaseQuery.order(column, { ascending: query.sort.direction === 'asc', foreignTable: 'teacher' })
  }

  // Execute the query
  const { data, count, error } = await supabaseQuery
    .range(from, to)
    .order('status', { ascending: false })
    .order('last_name', { ascending: true, foreignTable: 'teacher' })

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
  const client = createClient()
  const { error } = await client
    .from('schools_teachers')
    .update({ status })
    .eq('teacher_id', teacherId)
    .eq('school_id', schoolId)

  if (error)
    throw error
}

export async function createInviteTeacher(schoolId: string): Promise<string> {
  const supabase = createClient()

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
