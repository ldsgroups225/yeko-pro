'use server'

import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import type { LinkStudentParentData } from '@/validations'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { linkStudentParentSchema } from '@/validations'
import { snakeCase } from 'change-case'
import { nanoid } from 'nanoid'

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
          avatarUrl: _parent.avatar_url,
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
  subclasses: Array<{ slug: string, name: string }>
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
    subclasses: el.subclasses.map(s => ({ id: nanoid(), slug: s.slug, name: s.name })),
  } satisfies IClassesGrouped))

  return parsedClasses
}

export type TClassesBySchool = ClassRPCResponse[]

function buildSupabaseQuery(client: SupabaseClient, query: IStudentsQueryParams) {
  const _page = query.page ?? 1
  const _limit = query.limit ?? 10

  const from = (_page - 1) * _limit
  const to = from + _limit - 1

  let supabaseQuery = client
    .from('students')
    .select(`
      id, id_number, first_name, last_name, date_of_birth, gender,
      parent:users(first_name, last_name, phone, email, avatar_url),
      class:classes(id, name, slug)
    `, { count: 'exact' })
    .eq('school_id', query.schoolId!)

  if (query.searchTerm) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query.searchTerm}%,last_name.ilike.%${query.searchTerm}%,id_number.ilike.%${query.searchTerm}%`)
  }

  // Fixed: Filter by class slug using a proper join condition
  if (query.selectedClasses?.length) {
    supabaseQuery = supabaseQuery.in('class.slug', query.selectedClasses)
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

  return supabaseQuery
    .range(from, to)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
}

export async function linkStudentAndParent({ studentIdNumber, otp }: { studentIdNumber: string, otp: string }): Promise<boolean> {
  const client = getClient()

  function validateAndParseData(data: unknown): LinkStudentParentData {
    const result = linkStudentParentSchema.safeParse(data)

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => err.message).join(', ')
      throw new Error(errorMessages)
    }

    return result.data
  }

  async function checkOTP(sOTP: string): Promise<string> {
    const { data, error } = await client
      .from('link_student_parent')
      .select('parent_id, is_used, expired_at')
      .eq('otp', sOTP)
      .single()

    if (error || !data) {
      throw new Error('OTP invalide')
    }

    if (data.is_used) {
      throw new Error('Ce code a déjà été utilisé')
    }

    if (new Date(data.expired_at) < new Date()) {
      throw new Error('Ce code a expiré')
    }

    return data.parent_id
  }

  async function updateStudentParent(sId: string, parentId: string): Promise<void> {
    const { error } = await client
      .from('students')
      .update({ parent_id: parentId })
      .eq('id_number', sId)

    if (error) {
      throw new Error('Erreur lors de la mise à jour de l\'élève')
    }
  }

  async function markOTPAsUsed(sOTP: string): Promise<void> {
    const { error } = await client
      .from('link_student_parent')
      .update({ is_used: true })
      .eq('otp', sOTP)

    if (error) {
      throw new Error('Erreur lors de la mise à jour du statut de l\'OTP')
    }
  }

  try {
    const { studentIdNumber: sId, otp: sOTP } = validateAndParseData({
      studentIdNumber,
      otp,
    })

    const parentId = await checkOTP(sOTP)
    await updateStudentParent(sId, parentId)
    await markOTPAsUsed(sOTP)

    return true
  }
  catch (error) {
    throw new Error((error as Error).message)
  }
}
