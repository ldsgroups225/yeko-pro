'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { ICandidature, IGradeNote, IPonctualite } from '@/types'
import { revalidatePath } from 'next/cache'
import { NOTE_LABELS, NOTE_TYPE } from '@/constants'
import { createAuthorizationService } from '@/lib/services/authorizationService'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'

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
  attendance: {
    lateCount: number
    absencesCount: number
  }
}

async function getStudentPopulation({
  client,
  schoolId,
  schoolYearId,
  schoolYearEndYear,
}: {
  client: SupabaseClient
  schoolId: string
  schoolYearId: number
  schoolYearEndYear: number
}): Promise<{ total: number, yearOverYearGrowth: number }> {
  // Helper to get an exact count for a given school_year_id
  const countStudentsForSchoolYear = async (schoolYearId: number) => {
    const { error, count } = await client
      .from('student_school_class')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('enrollment_status', 'accepted')
      .is('is_active', true)
      .eq('school_year_id', schoolYearId)

    if (error)
      throw error
    return count ?? 0
  }

  try {
    // fetch current and most-recent non-current (last) school years in parallel
    const { data: lastSchoolYear, error: lastErr } = await client
      .from('school_years')
      .select('id, end_year')
      .is('is_current', false)
      .order('end_year', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastErr) {
      console.error('Error fetching school years:', lastErr?.message)
      return { total: 0, yearOverYearGrowth: 0 }
    }

    if ((lastSchoolYear?.end_year === schoolYearEndYear || (lastSchoolYear?.end_year === schoolYearEndYear + 1))) {
      throw new Error('L\'année scolaire actuelle est la même que l\'année scolaire précédente')
    }

    // If both school-year rows are actually the same (same id), only fetch one count
    let currentYearStudentCount = 0
    let lastYearStudentCount = 0

    if (!lastSchoolYear) {
      currentYearStudentCount = await countStudentsForSchoolYear(schoolYearId)
      lastYearStudentCount = currentYearStudentCount
    }
    else {
      const [currCount, lastCount] = await Promise.all([
        countStudentsForSchoolYear(schoolYearId),
        countStudentsForSchoolYear(lastSchoolYear.id),
      ])
      currentYearStudentCount = currCount
      lastYearStudentCount = lastCount
    }

    // Compute YoY growth. If lastYear is 0, growth is undefined -> return null
    let yearOverYearGrowth: number | null = null
    if (lastYearStudentCount > 0) {
      yearOverYearGrowth = ((currentYearStudentCount - lastYearStudentCount) / lastYearStudentCount) * 100
    }

    return { total: currentYearStudentCount, yearOverYearGrowth: yearOverYearGrowth ?? 0 }
  }
  catch (err) {
    console.error('Error fetching student population:', err)
    return { total: 0, yearOverYearGrowth: 0 }
  }
}

async function getStudentFiles({
  client,
  schoolId,
  schoolYearId,
}: {
  client: SupabaseClient
  schoolId: string
  schoolYearId: number
}): Promise<{ pendingApplications: number, withoutParent: number, withoutClass: number }> {
  const pendingApplicationsQs = client.from('student_school_class').select('student_id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('school_year_id', schoolYearId).eq('enrollment_status', 'pending')
  const withoutParentQs = client.from('student_school_class').select('students(parent_id)').eq('school_id', schoolId).eq('school_year_id', schoolYearId).is('students.parent_id', null)
  const withoutClassQs = client.from('student_school_class').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).eq('school_year_id', schoolYearId).is('class_id', null).eq('enrollment_status', 'accepted')

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
    return { pendingApplications: 0, withoutParent: 0, withoutClass: 0 }
  }

  return { pendingApplications: pendingApplications ?? 0, withoutParent: withoutParent ?? 0, withoutClass: withoutClass ?? 0 }
}

async function getTeachingStaff({
  client,
  schoolId,
}: {
  client: SupabaseClient
  schoolId: string
}): Promise<{ pendingApplications: number, withoutClass: number }> {
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

async function getSummaryAttendance({
  client,
  schoolId,
}: {
  client: SupabaseClient
  schoolId: string
}): Promise<{ lateCount: number, absencesCount: number }> {
  const { data, error } = await client
    .from('attendances')
    .select('status')
    .eq('school_id', schoolId)

  if (error) {
    console.error('Error fetching payments:', error)
    throw new Error('Failed to fetch payments')
  }

  const lateCount = data?.reduce((acc, p) => acc + (p.status === 'late' ? 1 : 0), 0) ?? 0
  const absencesCount = data?.reduce((acc, p) => acc + (p.status === 'absent' ? 1 : 0), 0) ?? 0

  return { lateCount, absencesCount }
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

export async function getNoteDetails({
  noteId,
  schoolId,
  schoolYearId,
}: {
  noteId: string
  schoolId: string
  schoolYearId: number
}): Promise<DetailedNote> {
  const supabase = await createClient()

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
    .eq('school_id', schoolId)
    .eq('school_year_id', schoolYearId)
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

  const noteTypeLabel = NOTE_LABELS[note.note_type as NOTE_TYPE] || note.note_type

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

export async function getDashboardMetrics(
  {
    schoolId,
    schoolYearId,
    schoolYearEndYear,
  }: { schoolId: string, schoolYearId: number, schoolYearEndYear: number },
): Promise<DashboardMetrics> {
  const supabase = await createClient()

  const [studentPopulation, studentFiles, teachingStaff, attendance] = await Promise.all([
    getStudentPopulation({ client: supabase, schoolId, schoolYearId, schoolYearEndYear }),
    getStudentFiles({ client: supabase, schoolId, schoolYearId }),
    getTeachingStaff({ client: supabase, schoolId }),
    getSummaryAttendance({ client: supabase, schoolId }),
  ])

  return { attendance, studentPopulation, studentFiles, teachingStaff }
}

export async function getPonctualiteData({
  schoolId,
  schoolYearId,
}: {
  schoolId: string
  schoolYearId: number
}): Promise<IPonctualite[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('attendances_report_view')
    .select('month, month_numeric, absences, lates')
    .eq('school_years_id', schoolYearId)
    .eq('school_id', schoolId)
  // TODO: .eq('student_id', 'student-uuid')
    .order('month_numeric', { ascending: true })

  if (error) {
    console.error('Error fetching ponctualite data:', error.message)
    return []
  }

  const groupedData = data?.reduce((acc, curr) => {
    const month = curr.month_numeric!
    if (!acc[month]) {
      acc[month] = { absences: 0, lates: 0, monthLabel: '' }
    }
    acc[month].absences += curr.absences!
    acc[month].lates += curr.lates!
    acc[month].monthLabel = curr.month!
    return acc
  }, {} as Record<number, { absences: number, lates: number, monthLabel: string }>)

  return Object.entries(groupedData).map(([_, data]) => ({
    month: data.monthLabel,
    absences: data.absences,
    lates: data.lates,
  })) satisfies IPonctualite[] ?? []
}

export async function getCandidatures({
  schoolId,
}: {
  schoolId: string
}): Promise<ICandidature[]> {
  const supabase = await createClient()

  // get teacher candidatures
  const teachersQs = supabase
    .from('schools_teachers')
    .select('status, created_at, teacher:users(id, first_name, last_name, email)')
    .eq('school_id', schoolId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // get student candidatures
  const studentsQs = supabase
    .from('student_school_class')
    .select('grade_id, enrollment_status, created_at, student:students(id, first_name, last_name)')
    .eq('school_id', schoolId)
    .eq('enrollment_status', 'pending')
    // .is('is_active', false) // TODO: check if this is needed
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

export async function getNotes({
  schoolId,
}: {
  schoolId: string
}): Promise<IGradeNote[]> {
  const supabase = await createClient()
  const ALLOWED_NOTE_TYPES = [
    NOTE_TYPE.WRITING_QUESTION,
    NOTE_TYPE.CLASS_TEST,
    NOTE_TYPE.LEVEL_TEST,
  ]

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

    if (error) {
      if (error.message.includes('La scolarité')) {
        throw error.message
      }
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

export async function getClassesByGrade(gradeId: number): Promise<{ id: string, name: string, remainingSeats: number }[]> {
  try {
    const [supabase, authorizationService] = await Promise.all([
      createClient(),
      createAuthorizationService(),
    ])

    const userId = await authorizationService.getAuthenticatedUserId()
    const schoolInfo = await authorizationService.getUserSchoolInfo(userId, {
      roleId: ERole.DIRECTOR,
      includeRoleName: false,
      withSchoolYear: true,
    })

    // Fetch classes with their associated students
    const classesQs = supabase
      .from('classes')
      .select(`
        id,
        name,
        max_student
      `)
      .eq('grade_id', gradeId)
      .eq('school_id', schoolInfo.id)

    const seatUsedQs = supabase
      .from('student_school_class')
      .select('class_id', { count: 'exact', head: true })
      .eq('grade_id', gradeId)
      .eq('school_id', schoolInfo.id)
      .eq('school_year_id', schoolInfo.schoolYear!.id)
      .eq('enrollment_status', 'accepted')
      .is('is_active', true)

    const [
      { data: classes, error: classesError },
      { count: seatUsed, error: seatUsedError },
    ] = await Promise.all([
      classesQs,
      seatUsedQs,
    ])

    if (classesError || seatUsedError) {
      console.error('Error fetching classes:', classesError?.message, seatUsedError?.message)
      throw new Error('Échec de la récupération des classes')
    }

    if (!classes) {
      return []
    }

    return classes.filter(c => c.max_student > (seatUsed ?? 0)).map(c => ({
      id: c.id,
      name: c.name,
      remainingSeats: c.max_student - (seatUsed ?? 0),
    }))
  }
  catch (error) {
    console.error('Error in getClassesByGrade:', error)
    throw error
  }
}
