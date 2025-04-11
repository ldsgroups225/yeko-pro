'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { ICandidature, IGradeNote, IPonctualite } from '@/types'
import { NOTE_OPTIONS_MAP, NOTE_TYPE } from '@/constants'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'
import { revalidatePath } from 'next/cache'

interface DashboardMetrics {
  studentPopulation: {
    total: number
    yearOverYearGrowth: number
  }
  studentFiles: {
    pendingApplications: number
    withoutParent: number
    withoutClass: number
  }
  teachingStaff: {
    pendingApplications: number
    withoutClass: number
  }
  payments: {
    onTimeRate: number
    improvement: number
  }
}

async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error: userSchoolError } = await client
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()
  if (userSchoolError) {
    console.error('Error fetching user school:', userSchoolError)
    throw new Error('Seul un directeur peut accéder à cette page')
  }

  if (!userSchool.school_id) {
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }
  return userSchool.school_id
}

async function getStudentPopulation(client: SupabaseClient, schoolId: string): Promise<{ total: number, yearOverYearGrowth: number }> {
  const { error, count } = await client
    .from('student_school_class')
    .select('*', { count: 'estimated' })
    .eq('school_id', schoolId)
    .eq('enrollment_status', 'accepted')
    .is('is_active', true)
    // TODO: .eq('school_years_id', 2023)  // Filter by school year

  if (error) {
    console.error('Error fetching student population:', error.message)
    return { total: 0, yearOverYearGrowth: 0 }
  }

  return { total: count || 0, yearOverYearGrowth: 15 } // TODO: implement yearOverYearGrowth calculation
}

async function getStudentFiles(client: SupabaseClient, schoolId: string): Promise<{ pendingApplications: number, withoutParent: number, withoutClass: number }> {
  const pendingApplicationsQs = client.from('student_school_class').select('student_id', { count: 'estimated' }).eq('school_id', schoolId).eq('enrollment_status', 'pending')
  const withoutParentQs = client.from('student_school_class').select('students(parent_id)').eq('school_id', schoolId).is('students.parent_id', null)
  const withoutClassQs = client.from('student_school_class').select('id', { count: 'estimated' }).eq('school_id', schoolId).is('class_id', null).eq('enrollment_status', 'accepted')

  const [
    { count: pendingApplications, error: pendingApplicationsError },
    { count: withoutParent, error: withoutParentError },
    { count: withoutClass, error: withoutClassError },
  ] = await Promise.all([
    pendingApplicationsQs,
    withoutParentQs,
    withoutClassQs,
  ])

  if (pendingApplicationsError || withoutParentError || withoutClassError) {
    console.error('Error fetching student files:', pendingApplicationsError?.message, withoutParentError?.message, withoutClassError?.message)
    console.error('Error fetching student files:', withoutParentError?.message, withoutClassError?.message)
    return { pendingApplications: 0, withoutParent: 0, withoutClass: 0 }
  }

  return { pendingApplications: pendingApplications ?? 0, withoutParent: withoutParent ?? 0, withoutClass: withoutClass ?? 0 }
}

async function getTeachingStaff(client: SupabaseClient, schoolId: string): Promise<{ pendingApplications: number, withoutClass: number }> {
  // Queries for counts
  const schoolTeacherCountQs = client.from('schools_teachers')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'accepted')

  const pendingApplicationsQs = client.from('schools_teachers')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'pending')

  const withClassQs = client.from('teacher_class_assignments')
    .select('teacher_id')
    .eq('school_id', schoolId)
    .is('is_main_teacher', false)

  const [
    { count: pendingApplications, error: pendingApplicationsError },
    { count: schoolTeachers, error: schoolTeachersError },
    { data: assignmentsData, error: withoutClassError },
  ] = await Promise.all([
    pendingApplicationsQs,
    schoolTeacherCountQs,
    withClassQs,
  ])

  // Handle errors first
  if (pendingApplicationsError || withoutClassError || schoolTeachersError) {
    console.error('Error fetching teaching staff:', pendingApplicationsError?.message, withoutClassError?.message, schoolTeachersError?.message,
    )
    return { pendingApplications: 0, withoutClass: 0 }
  }

  // Process teachers without classes
  const teacherIds = assignmentsData?.map(a => a.teacher_id) ?? []
  const uniqueTeacherIds = Array.from(new Set(teacherIds))
  const withoutClassCount = (schoolTeachers ?? 0) - uniqueTeacherIds.length

  return {
    pendingApplications: pendingApplications ?? 0,
    withoutClass: withoutClassCount,
  }
}

async function getPayments(client: SupabaseClient, schoolId: string): Promise<{ onTimeRate: number, improvement: number }> {
  const { data, error } = await client
    .from('payment_plans')
    .select('total_amount, amount_paid, student: student_school_class(school_id)')
    .eq('student.school_id', schoolId)
    .throwOnError()

  if (error) {
    console.error('Error fetching payments:', error)
    throw new Error('Failed to fetch payments')
  }

  const totalPayment = data?.reduce((acc, p) => acc + p.total_amount, 0) ?? 0
  const totalPaid = data?.reduce((acc, p) => acc + p.amount_paid, 0) ?? 0

  const onTimeRate = totalPaid / totalPayment
  const improvement = (totalPayment - totalPaid) / totalPayment // TODO: implement yearOverYearGrowth calculation

  return { onTimeRate, improvement }
}

interface NoteDetail {
  studentId: string
  studentFirstName: string
  studentLastName: string
  note: number | null
  gradedAt: string | null
}

export interface DetailedNote extends IGradeNote {
  description: string | null
  noteType: string
  totalPoints: number
  weight: number | null
  details: NoteDetail[]
}

export async function getNoteDetails(noteId: string): Promise<DetailedNote> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  await getDirectorSchoolId(supabase, userId)

  const { data: note, error } = await supabase
    .from('notes')
    .select(`
      id,
      classroom: classes(name),
      due_date,
      description,
      note_type,
      total_points,
      weight,
      subject: subjects(name),
      teacher: users(first_name, last_name, email),
      details: note_details(
        student_id,
        note,
        graded_at,
        student:students(
          first_name,
          last_name
        )
      ),
      is_published,
      created_at
    `)
    .eq('id', noteId)
    .single()

  if (error) {
    console.error('Error fetching note details:', error)
    throw new Error('Échec de la récupération des détails de la note')
  }

  const details: NoteDetail[] = note.details.map((detail: any) => ({
    studentId: detail.student_id,
    studentFirstName: detail.student.first_name,
    studentLastName: detail.student.last_name,
    note: detail.note,
    gradedAt: detail.graded_at,
  }))

  // Calculate min and max notes
  const validNotes = details.map(d => d.note).filter((n): n is number => n !== null)
  const minNote = validNotes.length ? Math.min(...validNotes) : 0
  const maxNote = validNotes.length ? Math.max(...validNotes) : 0

  const noteTypeLabel = NOTE_OPTIONS_MAP[note.note_type as NOTE_TYPE] || note.note_type

  return {
    id: note.id,
    classroom: note.classroom?.name || 'Classe inconnue',
    studentCount: details.length,
    minNote,
    maxNote,
    createdAt: note.due_date ?? note.created_at,
    teacher: formatFullName(
      note.teacher?.first_name,
      note.teacher?.last_name,
      note.teacher?.email,
    ),
    subject: note.subject?.name || 'Matière inconnue',
    status: note.is_published ? 'Publié' : 'À publier',
    description: note.description,
    noteType: noteTypeLabel,
    totalPoints: note.total_points,
    weight: note.weight,
    details,
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  const studentPopulation = await getStudentPopulation(supabase, schoolId)
  const studentFiles = await getStudentFiles(supabase, schoolId)
  const teachingStaff = await getTeachingStaff(supabase, schoolId)
  const payments = await getPayments(supabase, schoolId)

  return { payments, studentPopulation, studentFiles, teachingStaff }
}

export async function getPonctualiteData(): Promise<IPonctualite[]> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  await getDirectorSchoolId(supabase, userId)

  const { data, error } = await supabase
    .from('attendances_report_view')
    .select('month, absences, lates')
  // TODO: .eq('student_id', 'student-uuid')
  // TODO: .eq('school_years_id', 2023)  // Filter by school year
    .order('month', { ascending: true })

  if (error) {
    console.error('Error fetching ponctualite data:', error.message)
    return []
  }

  return data?.map(d => ({
    month: d.month!,
    absences: d.absences!,
    lates: d.lates!,
  } satisfies IPonctualite)) ?? []
}

export async function getCandidatures(): Promise<ICandidature[]> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  await getDirectorSchoolId(supabase, userId)

  // get teacher candidatures
  const teachersQs = supabase
    .from('schools_teachers')
    .select('status, created_at, teacher:users(id, first_name, last_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // get student candidatures
  const studentsQs = supabase
    .from('student_school_class')
    .select('grade_id, enrollment_status, created_at, student:students(id, first_name, last_name)')
    .eq('enrollment_status', 'pending')
    .order('created_at', { ascending: true })

  // promise all
  const [
    { data: teachers, error: teachersError },
    { data: students, error: studentsError },
  ] = await Promise.all([
    teachersQs,
    studentsQs,
  ])

  if (teachersError || studentsError) {
    console.error('Error fetching candidatures:', teachersError?.message || studentsError?.message)
    return []
  }

  const deserializeTeachers: ICandidature[] = teachers.map(
    teacher => ({
      candidateId: teacher.teacher.id,
      time: teacher.created_at!,
      name: formatFullName(
        teacher.teacher.first_name!,
        teacher.teacher.last_name!,
        teacher.teacher.email,
      ),
      type: 'teacher',
      status: teacher.status,
    }),
  )

  const deserializeStudents: ICandidature[] = students.map(
    student => ({
      candidateId: student.student.id,
      time: student.created_at!,
      name: formatFullName(
        student.student.first_name!,
        student.student.last_name!,
      ),
      type: 'student',
      status: student.enrollment_status,
      grade: student.grade_id,
    }),
  )

  const mergedData = [...deserializeTeachers, ...deserializeStudents]

  // return sorted mergedData
  return mergedData.sort((a, b) => {
    if (a.time > b.time)
      return -1
    if (a.time < b.time)
      return 1
    return 0
  })
}

export async function getNotes(): Promise<IGradeNote[]> {
  const supabase = await createClient()
  const ALLOWED_NOTE_TYPES = [
    NOTE_TYPE.WRITING_QUESTION,
    NOTE_TYPE.CLASS_TEST,
    NOTE_TYPE.LEVEL_TEST,
  ]

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  const { data, error } = await supabase
    .from('notes')
    .select(`
        id,
        classroom: classes(name),
        due_date,
        notes: note_details(note),
        teacher: users(first_name, last_name, email),
        subject: subjects(name),
        is_published,
        created_at
      `)
    .eq('school_id', schoolId)
    .eq('is_published', false)
    .in('note_type', ALLOWED_NOTE_TYPES)
    .throwOnError()

  if (error) {
    console.error('Error fetching notes:', error)
    throw new Error('Échec de la récupération des notes')
  }

  // Helper functions for note calculations
  const calculateMinNote = (notes: Array<{ note?: number | null }>) => {
    if (!notes?.length)
      return 0
    return notes.reduce((min, { note }) => Math.min(min, note ?? 0), Infinity)
  }

  const calculateMaxNote = (notes: Array<{ note?: number | null }>) => {
    if (!notes?.length)
      return 0
    return notes.reduce((max, { note }) => Math.max(max, note ?? 0), -Infinity)
  }

  return data.map(note => ({
    id: note.id,
    classroom: note.classroom?.name || 'Classe inconnue',
    studentCount: note.notes?.length || 0,
    minNote: calculateMinNote(note.notes),
    maxNote: calculateMaxNote(note.notes),
    createdAt: note.due_date ?? note.created_at,
    teacher: formatFullName(
      note.teacher?.first_name,
      note.teacher?.last_name,
      note.teacher?.email,
    ),
    subject: note.subject?.name || 'Matière inconnue',
    status: note.is_published ? 'Publié' : 'À publier',
  } satisfies IGradeNote))
}

export async function publishNote(noteId: string): Promise<void> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  await getDirectorSchoolId(supabase, userId)

  const { error } = await supabase
    .from('notes')
    .update({ is_published: true })
    .eq('id', noteId)
    .throwOnError()

  if (error) {
    console.error('Error publishing notes:', error)
    throw new Error('Échec de la publication des notes')
  }
}

export async function handleCandidature(
  candidateId: string,
  candidateType: 'student' | 'teacher',
  action: 'accept' | 'reject',
  classId?: string,
): Promise<void> {
  const supabase = await createClient()

  if (candidateType === 'student') {
    if (action === 'accept' && !classId) {
      throw new Error('Il faut sélectionner une classe pour accepter une candidature')
    }

    const { error } = await supabase
      .from('student_school_class')
      .update({
        enrollment_status: action === 'accept' ? 'accepted' : 'refused',
        is_active: action === 'accept',
        class_id: action === 'accept' ? classId : null,
      })
      .eq('student_id', candidateId)
      .throwOnError()

    if (error) {
      console.error('Error handling student candidature:', error)
      throw new Error('Échec de la gestion de la candidature')
    }

    revalidatePath('/t/dashboard')
  }
  else {
    const { error } = await supabase
      .from('schools_teachers')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('teacher_id', candidateId)
      .throwOnError()

    if (error) {
      console.error('Error handling teacher candidature:', error)
      throw new Error('Échec de la gestion de la candidature')
    }

    revalidatePath('/t/dashboard')
  }
}

export async function getClassesByGrade(gradeId: number): Promise<{ id: string, name: string }[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('grade_id', gradeId)
    .throwOnError()

  if (error) {
    console.error('Error fetching classes by grade:', error)
    throw new Error('Échec de la récupération des classes')
  }

  return data
}
