import type { IStudentDTO, IStudentsQueryParams } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { snakeCase } from 'change-case'

export class StudentService {
  private static instance: StudentService
  private constructor() {}

  public static getInstance(): StudentService {
    if (!StudentService.instance) {
      StudentService.instance = new StudentService()
    }
    return StudentService.instance
  }

  private getClient(): SupabaseClient {
    return createClient()
  }

  public async getStudents(query: IStudentsQueryParams): Promise<{ data: IStudentDTO[] | null, totalCount: number | null }> {
    const client = this.getClient()
    const { data, count } = await this.buildSupabaseQuery(client, query)
    return { data: data as IStudentDTO[] | null, totalCount: count }
  }

  public async getStudentById(id: string): Promise<IStudentDTO | null> {
    const client = this.getClient()
    const { data } = await client
      .from('students')
      .select('*')
      .eq('id', id)
      .single()
    return data as IStudentDTO | null
  }

  public async getStudentByIdNumber(idNumber: string): Promise<IStudentDTO | null> {
    const client = this.getClient()
    const { data } = await client
      .from('students')
      .select('*')
      .eq('id_number', idNumber)
      .single()
    return data as IStudentDTO | null
  }

  public async createStudent(params: Pick<IStudentDTO, 'firstName' | 'lastName' | 'schoolId' | 'classId' | 'idNumber'>): Promise<IStudentDTO | null> {
    const client = this.getClient()
    const { data } = await client
      .from('students')
      .insert(params)
      .select()
      .single()
    return data as IStudentDTO | null
  }

  public async updateStudent(params: Partial<IStudentDTO> & { id: string }): Promise<IStudentDTO | null> {
    const client = this.getClient()
    const { data } = await client
      .from('students')
      .update(params)
      .eq('id', params.id)
      .select()
      .single()
    return data as IStudentDTO | null
  }

  public async deleteStudent(id: string): Promise<boolean> {
    const client = this.getClient()
    const { error } = await client
      .from('students')
      .delete()
      .eq('id', id)
    return !error
  }

  public async getStudentParentById(parentId: string): Promise<IStudentDTO | null> {
    const client = this.getClient()
    const { data } = await client
      .from('students')
      .select('*')
      .eq('parent_id', parentId)
      .single()
    return data as IStudentDTO | null
  }

  private buildSupabaseQuery(client: SupabaseClient, query: IStudentsQueryParams) {
    let supabaseQuery = client
      .from('students')
      .select('*, class:classes(name)', { count: 'exact' })
      .eq('school_id', query.schoolId!)

    if (query.searchTerm) {
      supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query.searchTerm}%,last_name.ilike.%${query.searchTerm}%,id_number.ilike.%${query.searchTerm}%`)
    }
    if (query.selectedClasses?.length) {
      supabaseQuery = supabaseQuery.in('class_id', query.selectedClasses)
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
}
