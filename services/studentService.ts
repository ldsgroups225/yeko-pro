'use server'

import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { snakeCase } from 'change-case'
import { nanoid } from 'nanoid'

// TODO: remove hard typed `SupabaseClient`
function getClient(): SupabaseClient {
  return createClient()
}

export async function getStudents(query: IStudentsQueryParams): Promise<{ data: IStudentDTO[], totalCount: number | null }> {
  const client = getClient()
  const { data, count } = await buildSupabaseQuery(client, query)
  return {
    data: data?.map((student) => {
      const _class = student.class as any
      const _parent = student.parent as any

      return {
        id: student.id,
        idNumber: student.id_number,
        firstName: student.first_name,
        lastName: student.last_name,
        dateOfBirth: student.date_of_birth,
        gender: student.gender,
        parent: _parent && {
          id: _parent.id!,
          fullName: formatFullName(_parent.first_name, _parent.last_name, _parent.email),
          email: _parent.email!,
          phoneNumber: _parent.phone!,
        },
        classroom: _class && {
          id: _class.id,
          name: _class.name,
        },
      } satisfies IStudentDTO
    }) ?? [],
    totalCount: count,
  }
}

export async function getStudentById(id: string): Promise<IStudentDTO | null> {
  const client = getClient()
  const { data } = await client
    .from('students')
    .select('*')
    .eq('id', id)
    .single()
  return data as IStudentDTO | null
}

export async function getStudentByIdNumber(idNumber: string): Promise<IStudentDTO | null> {
  const client = getClient()
  const { data } = await client
    .from('students')
    .select('*')
    .eq('id_number', idNumber)
    .single()
  return data as IStudentDTO | null
}

export async function createStudent(params: Pick<IStudentDTO, 'firstName' | 'lastName' | 'schoolId' | 'classId' | 'idNumber'>): Promise<IStudentDTO | null> {
  const client = getClient()
  const { data } = await client
    .from('students')
    .insert(params)
    .select()
    .single()
  return data as IStudentDTO | null
}

export async function updateStudent(params: Partial<IStudentDTO> & { id: string }): Promise<IStudentDTO | null> {
  const client = getClient()
  const { data } = await client
    .from('students')
    .update(params)
    .eq('id', params.id)
    .select()
    .single()
  return data as IStudentDTO | null
}

export async function deleteStudent(id: string): Promise<boolean> {
  const client = getClient()
  const { error } = await client
    .from('students')
    .delete()
    .eq('id', id)
  return !error
}

export async function getStudentParentById(parentId: string): Promise<IStudentDTO | null> {
  const client = getClient()
  const { data } = await client
    .from('students')
    .select('*')
    .eq('parent_id', parentId)
    .single()
  return data as IStudentDTO | null
}

interface ClassRPCResponse {
  grade_name: string
  count: number
  subclasses: Array<{ id: string, name: string }>
}

export async function fetchClassesBySchool(schoolId: string) {
  const client = createClient()
  const { data, error } = await client.rpc('get_classes_by_school', { school_id: schoolId })
  if (error) {
    console.error('Error fetching grouped classes:', error)
    throw new Error('Erreur lors de la récupération des classes groupées')
  }

  const parsedClasses = (data as ClassRPCResponse[]).map(el => ({
    id: nanoid(),
    name: el.grade_name,
    count: el.count,
    subclasses: el.subclasses.map(s => ({ id: s.id, name: s.name })),
  } satisfies IClassesGrouped))

  return parsedClasses
}

export type TClassesBySchool = ClassRPCResponse[]

function buildSupabaseQuery(client: SupabaseClient, query: IStudentsQueryParams) {
  let supabaseQuery = client
    .from('students')
    .select(`
      id, id_number, first_name, last_name, date_of_birth, gender,
      parent:users(first_name, last_name, phone, email),
      class:classes(name)
    `, { count: 'exact' })
    .eq('school_id', query.schoolId!)

  if (query.searchTerm) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query.searchTerm}%,last_name.ilike.%${query.searchTerm}%,id_number.ilike.%${query.searchTerm}%`)
  }
  if (query.selectedClassesId?.length) {
    supabaseQuery = supabaseQuery.in('class_id', query.selectedClassesId)
  }
  if (query.hasNotClassFilter) {
    supabaseQuery = supabaseQuery.is('class_id', null)
  }
  if (query.hasNotParentFilter) {
    supabaseQuery = supabaseQuery.is('parent_id', null)
  }
  if (query.sort?.column) {
    supabaseQuery = supabaseQuery.order(snakeCase(query.sort.column), { ascending: query.sort.direction === 'asc' })
  }

  return supabaseQuery.range((query.page! - 1) * query.itemsPerPage!, query.page! * query.itemsPerPage! - 1)
}
