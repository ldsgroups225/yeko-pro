'use server'

import type { StudentStats } from '@/app/t/(schools)/(navigations)/students/[idNumber]/types'
import type { SupabaseClient } from '@/lib/supabase/server'
import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import type { LinkStudentParentData, StudentFormValues } from '@/validations'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { linkStudentParentSchema } from '@/validations'
import { camelCase, snakeCase } from 'change-case'
import { parseISO } from 'date-fns'
import { nanoid } from 'nanoid'
import { uploadImageToStorage } from './uploadImageService'

export async function getStudents(query: IStudentsQueryParams): Promise<{ data: IStudentDTO[], totalCount: number | null }> {
  const supabase = await createClient()

  const { data, count, error } = await buildSupabaseQuery(supabase, query)

  if (error)
    throw error

  return {
    data: data?.map((student) => {
      const _class = student.classes
      const _parent = student.parent

      return {
        id: student.student_id!,
        idNumber: student.id_number!,
        lastName: student.last_name!,
        firstName: student.first_name!,
        avatarUrl: student.students!.avatar_url,
        dateOfBirth: student.students!.date_of_birth,
        gender: (student.students as { gender: 'M' | 'F' | null }).gender,
        parent: _parent
          ? {
              id: student.parent_id!,
              fullName: formatFullName(_parent.first_name, _parent.last_name, _parent.email),
              email: _parent.email!,
              phoneNumber: _parent.phone!,
              avatarUrl: _parent.avatar_url,
            }
          : undefined,
        classroom: _class
          ? {
              id: _class.id,
              name: _class.name,
            }
          : undefined,
      } satisfies IStudentDTO
    }) ?? [],
    totalCount: count,
  }
}

export async function getStudentById(id: string): Promise<IStudentDTO | null> {
  const client = await createClient()
  const { data } = await client
    .from('students')
    .select(`
        id, id_number, first_name, last_name, date_of_birth, gender, avatar_url, address,
        created_at, created_by, updated_at, updated_by,
        parent:users(first_name, last_name, phone, email, avatar_url),
        class:classes(id, name, slug)
      `)
    .eq('id', id)
    .single()

  if (!data)
    return null

  const _class = data.class as any
  const _parent = data.parent as any

  return {
    id: data.id,
    idNumber: data.id_number,
    firstName: data.first_name,
    lastName: data.last_name,
    dateOfBirth: data.date_of_birth,
    avatarUrl: data.avatar_url,
    address: data.address,
    gender: (data as { gender: 'M' | 'F' | null }).gender,
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
    createdAt: data.created_at,
    createdBy: data.created_by,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  } satisfies IStudentDTO
}

export async function getStudentByIdNumberForEdit(idNumber: string): Promise<StudentFormValues> {
  const client = await createClient()
  const { data, error } = await client
    .from('students')
    .select(`
        id, id_number, first_name, last_name, date_of_birth, gender, avatar_url, address,
        grade:grades(name)
      `)
    .eq('id_number', idNumber)
    .single()

  const {
    data: gradeData,
    error: gradeError,
  } = await client
    .from('student_school_class')
    .select('grade_id, grade:grades(name)')
    .eq('student_id', data!.id)
    .eq('enrollment_status', 'accepted')
    .is('is_active', true)
    .single()

  if (error || gradeError) {
    console.error('student to edit error fetch error', error || gradeError)
    throw new Error('student to edit error fetch error')
  }

  const _grade = gradeData.grade ? { name: gradeData.grade.name } : undefined

  return {
    id: data.id,
    idNumber: data.id_number,
    firstName: data.first_name,
    lastName: data.last_name,
    gradeName: _grade?.name,
    dateOfBirth: data.date_of_birth ? parseISO(data.date_of_birth) : null,
    avatarUrl: data.avatar_url,
    address: data.address,
    gender: (data as { gender: 'M' | 'F' | null }).gender,
  } satisfies StudentFormValues
}

export async function getStudentByIdNumber(idNumber: string): Promise<IStudentDTO | null> {
  const client = await createClient()
  const { data: student, error: studentError } = await client
    .from('students')
    .select(`
        id, id_number, first_name, last_name, date_of_birth, gender, avatar_url, address,
        created_at, created_by, updated_at, updated_by,
        parent:users(first_name, last_name, phone, email, avatar_url)
      `)
    .eq('id_number', idNumber)
    .single()

  const { data: classroom, error: classroomError } = await client
    .from('student_school_class')
    .select('class_id, class:classes(id, name, slug)')
    .eq('student_id', student!.id)
    .eq('enrollment_status', 'accepted')
    .is('is_active', true)
    .single()

  if (studentError || classroomError) {
    console.error('studentError', studentError)
    console.error('classroomError', classroomError)
    throw new Error('Erreur lors de la récupération des données de l\'élève')
  }

  if (!student)
    return null

  const _parent = student.parent as any

  return {
    id: student.id,
    idNumber: student.id_number,
    firstName: student.first_name,
    lastName: student.last_name,
    dateOfBirth: student.date_of_birth,
    avatarUrl: student.avatar_url,
    address: student.address,
    gender: (student as { gender: 'M' | 'F' | null }).gender,
    parent: _parent && {
      id: _parent.id!,
      fullName: formatFullName(_parent.first_name, _parent.last_name, _parent.email),
      email: _parent.email!,
      phoneNumber: _parent.phone!,
      avatarUrl: _parent.avatar_url,
    },
    classroom: classroom?.class_id && classroom?.class
      ? {
          id: classroom.class_id,
          name: classroom.class.name,
        }
      : undefined,
    createdAt: student.created_at,
    createdBy: student.created_by,
    updatedAt: student.updated_at,
    updatedBy: student.updated_by,
  } satisfies IStudentDTO
}

export async function createStudent(params: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<string> {
  const client = await createClient()

  const isBase64 = params.avatarUrl?.startsWith('data:image')

  const snakeCaseParams = Object.fromEntries(Object.entries(params).map(([key, value]) => [snakeCase(key), value]))

  const { data, error } = await client
    .from('students')
    .insert(snakeCaseParams as any)
    .select()
    .single()

  if (error) {
    console.error('Fail to create student', error)
    throw new Error(error.message)
  }

  if (isBase64) {
    if (!params.avatarUrl) {
      throw new Error('Incorrect avatar')
    }
    // Process avatar upload and update params with new URL
    const newAvatarUrl = await uploadImageToStorage(client, 'student_avatar', data.id, params.avatarUrl)
    params.avatarUrl = newAvatarUrl
  }

  return data.id
}

export async function updateStudent(params: Partial<IStudentDTO> & { id: string }): Promise<IStudentDTO> {
  const client = await createClient()

  delete params.idNumber

  const isBase64 = params.avatarUrl?.startsWith('data:image')
  if (!isBase64) {
    delete params.avatarUrl
  }
  else {
    if (!params.avatarUrl) {
      throw new Error('Incorrect avatar')
    }
    // Process avatar upload and update params with new URL
    const newAvatarUrl = await uploadImageToStorage(client, 'student_avatar', params.id, params.avatarUrl)
    params.avatarUrl = newAvatarUrl
  }

  const snakeCaseParams = Object.keys(params).reduce<Record<string, any>>((acc, key) => {
    const snakeKey = snakeCase(key)
    acc[snakeKey] = params[key as keyof typeof params]
    return acc
  }, {})

  const { data, error } = await client
    .from('students')
    .update(snakeCaseParams)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating student:', error)
    throw new Error('Erreur lors de la mise à jour du profil de l\'élève')
  }

  const camelCaseParams = Object.keys(data).reduce<Record<string, any>>((acc, key) => {
    const camelKey = camelCase(key)
    acc[camelKey] = params[key as keyof typeof params]
    return acc
  }, {})

  return camelCaseParams as IStudentDTO
}

export async function deleteStudent(id: string): Promise<boolean> {
  const client = await createClient()
  const { error } = await client
    .from('students')
    .delete()
    .eq('id', id)
  return !error
}

export async function getStudentParentById(parentId: string): Promise<IStudentDTO | null> {
  const client = await createClient()
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
  subclasses: Array<{ id: string, slug: string, name: string }>
}

export async function fetchClassesBySchool(schoolId: string) {
  const client = await createClient()
  const { data, error } = await client.rpc('get_classes_by_school', { school_id: schoolId })
  if (error) {
    console.error('Error fetching grouped classes:', error)
    throw new Error('Erreur lors de la récupération des classes groupées')
  }

  const parsedClasses = (data as ClassRPCResponse[]).map(el => ({
    id: nanoid(),
    name: el.grade_name,
    count: el.count,
    subclasses: el.subclasses.map(s => ({ id: s.id ?? nanoid(), slug: s.slug, name: s.name })),
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
    .from('student_enrollment_view')
    .select(`
      student_id, enrollment_status, id_number, first_name, last_name, parent_id, class_id,
      students(date_of_birth, gender, avatar_url),
      parent:users(first_name, last_name, phone, email, avatar_url),
      classes!inner(id, name, slug)
      `, { count: 'exact' })
    .eq('school_id', query.schoolId!)

  if (query.refusedStudentsFilter) {
    supabaseQuery = supabaseQuery.eq('enrollment_status', 'refused')
  }
  else {
    supabaseQuery = supabaseQuery.eq('enrollment_status', 'accepted')
  }

  if (query.searchTerm) {
    supabaseQuery = supabaseQuery.or(`first_name.ilike.%${query.searchTerm}%,last_name.ilike.%${query.searchTerm}%,id_number.ilike.%${query.searchTerm}%`)
  }

  if (query.selectedClasses?.length) {
    supabaseQuery = supabaseQuery.in('classes.slug', query.selectedClasses)
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
  const client = await createClient()

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

export async function bulkAddStudentsToClass(classId: string, studentIdNumber: string[]): Promise<void> {
  const client = await createClient()

  const {
    data: studentIDs,
    error: studentIDsError,
  } = await client
    .from('students')
    .select('id')
    .in('id_number', studentIdNumber)

  if (studentIDsError)
    throw studentIDsError

  const _studentIDs = studentIDs.map(s => s.id)

  const { error } = await client
    .from('student_school_class')
    .update({ class_id: classId })
    .in('student_id', _studentIDs)

  if (error)
    throw error
}

export async function getStudentStats(studentId: string): Promise<StudentStats> {
  const supabase = await createClient()

  // 1. Get current school year and semester
  const { data: currentYear } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  const { data: currentSemester } = await supabase
    .from('semesters')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentYear?.id || !currentSemester?.id) {
    throw new Error('Current school year or semester not found')
  }

  // 2. Get Attendance Stats
  const { data: attendances } = await supabase
    .from('attendances')
    .select('status')
    .eq('student_id', studentId)
    .eq('school_years_id', currentYear.id)
    .eq('semesters_id', currentSemester.id)

  // 3. Get Academic Average
  const { data: average } = await supabase
    .from('average_grades_view_with_rank')
    .select('average_grade')
    .eq('student_id', studentId)
    .eq('school_year_id', currentYear.id)
    .eq('semester_id', currentSemester.id)
    .single()

  // 4. Get Payment Status
  const { data: payment } = await supabase
    .from('payment_details_view')
    .select(`
      total_amount,
      payment_amount,
      remaining_amount
    `)
    .eq('student_id', studentId)
    .eq('school_year', currentYear.id)
    .single()

  // 5. Get Behavior Score
  const { data: behavior } = await supabase
    .from('notes')
    .select(`
      id,
      note_details!inner(note)
    `)
    .eq('school_year_id', currentYear.id)
    .eq('semester_id', currentSemester.id)
    .eq('note_type', 'behavior')
    .eq('note_details.student_id', studentId)

  // Calculate attendance percentage
  const totalAttendances = attendances?.length || 0
  const presentAttendances = attendances?.filter(a => a.status === 'present').length || 0
  const attendancePercentage = totalAttendances ? (presentAttendances / totalAttendances) * 100 : 100

  // Calculate payment percentage and status
  const paymentPercentage = payment?.total_amount
    ? ((payment.payment_amount || 0) / payment.total_amount) * 100
    : 0

  let paymentStatus: 'up_to_date' | 'pending' | 'late' = 'pending'
  if (paymentPercentage === 100) {
    paymentStatus = 'up_to_date'
  }
  else if (paymentPercentage === 0) {
    paymentStatus = 'pending'
  }
  else {
    paymentStatus = 'late'
  }

  // Calculate behavior score and status
  const behaviorScore = behavior?.length
    ? behavior.reduce((acc, curr) => acc + (curr.note_details?.[0]?.note || 0), 0) / behavior.length
    : 0

  const getBehaviorStatus = (score: number) => {
    if (score >= 90)
      return 'Excellent'
    if (score >= 80)
      return 'Très Bien'
    if (score >= 70)
      return 'Bien'
    if (score >= 60)
      return 'Assez Bien'
    if (score >= 50)
      return 'Passable'
    return 'À améliorer'
  }

  return {
    attendance: Math.round(attendancePercentage),
    average: Number(average?.average_grade?.toFixed(1)) || 0,
    payment: {
      status: paymentStatus,
      percentage: Math.round(paymentPercentage),
    },
    behavior: {
      status: getBehaviorStatus(behaviorScore),
      score: Math.round(behaviorScore),
    },
  }
}

interface SchoolYear {
  id: number
}

interface Semester {
  id: number
  semester_name: string
  start_date: string
  end_date: string
}

interface AverageGrade {
  average_grade: number | null
  rank: string | null
}

interface SubjectNote {
  subject: {
    id: string
    name: string
  }
  note_details: Array<{
    note: number | null
  }>
  coefficients: Array<{
    coefficient: number
  }>
}

interface TeacherNote {
  id: string
  description: string | null
  created_at: string
  teacher: {
    first_name: string
    last_name: string
  }
  teacher_class_assignments: Array<{
    is_main_teacher: boolean
  }>
}

export async function getStudentAcademicData(studentId: string) {
  const supabase = await createClient()

  // 1. Get current school year and semester
  const { data: currentYear } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single() as { data: SchoolYear | null }

  if (!currentYear?.id) {
    throw new Error('Current school year not found')
  }

  const { data: semesters } = await supabase
    .from('semesters')
    .select('*')
    .eq('school_year_id', currentYear.id)
    .order('start_date', { ascending: true }) as { data: Semester[] | null }

  if (!semesters?.length) {
    throw new Error('No semesters found')
  }

  // 2. Get Academic Averages and Ranks for each semester
  const semesterData = await Promise.all(
    semesters.map(async (semester) => {
      const { data: averageData } = await supabase
        .from('average_grades_view_with_rank')
        .select('average_grade, rank')
        .eq('student_id', studentId)
        .eq('school_year_id', currentYear.id)
        .eq('semester_id', semester.id)
        .single() as { data: AverageGrade | null }

      return {
        id: semester.id,
        name: semester.semester_name,
        average: averageData?.average_grade || null,
        isComplete: new Date() > new Date(semester.end_date),
        startDate: semester.start_date,
        endDate: semester.end_date,
        rank: averageData?.rank
          ? {
              position: Number.parseInt(averageData.rank.split('/')[0]),
              total: Number.parseInt(averageData.rank.split('/')[1]),
            }
          : undefined,
      }
    }),
  )

  // 3. Get Subject Grades
  const { data: subjects } = await supabase
    .from('notes')
    .select(`
      subject:subjects(id, name),
      note_details!inner(note),
      coefficients!inner(coefficient)
    `)
    .eq('school_year_id', currentYear.id)
    .eq('semester_id', semesters[0].id)
    .eq('note_details.student_id', studentId)
    .neq('note_type', 'behavior') as { data: SubjectNote[] | null }

  const processedSubjects = subjects?.map(subject => ({
    id: subject.subject.id,
    name: subject.subject.name,
    grade: subject.note_details[0]?.note || null,
    coefficient: subject.coefficients[0]?.coefficient || 1,
  })) || []

  // 4. Get Teacher Observations
  const { data: observations } = await supabase
    .from('notes')
    .select(`
      id,
      description,
      created_at,
      teacher:users!teacher_id(first_name, last_name),
      teacher_class_assignments!inner(is_main_teacher)
    `)
    .eq('school_year_id', currentYear.id)
    .eq('note_type', 'observation')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false }) as { data: TeacherNote[] | null }

  const processedObservations = observations?.map(obs => ({
    id: obs.id,
    content: obs.description || '',
    date: obs.created_at,
    teacher: {
      name: `${obs.teacher.first_name} ${obs.teacher.last_name}`,
      isMainTeacher: obs.teacher_class_assignments[0]?.is_main_teacher || false,
    },
  })) || []

  return {
    semesters: semesterData,
    subjects: processedSubjects,
    observations: processedObservations,
  }
}
