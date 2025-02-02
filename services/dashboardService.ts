import type { SupabaseClient } from '@/lib/supabase/server'
import { NOTE_TYPE } from '@/constants'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole, type ICandidature, type IGradeNote, type IPonctualite } from '@/types'

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

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Random error simulation (20% chance)
const simulateError = () => Math.random() < 0.05

// Mock data
const metrics: DashboardMetrics = {
  studentPopulation: {
    total: 3469,
    yearOverYearGrowth: 15,
  },
  studentFiles: {
    pendingApplications: 24,
    withoutParent: 45,
    withoutClass: 12,
  },
  teachingStaff: {
    pendingApplications: 8,
    withoutClass: 5,
  },
  payments: {
    onTimeRate: 92,
    improvement: 8,
  },
}

const ponctualiteData: IPonctualite[] = [
  { month: 'Sept', absences: 45, lates: 30 },
  { month: 'Oct', absences: 52, lates: 35 },
  { month: 'Nov', absences: 48, lates: 28 },
  { month: 'Déc', absences: 70, lates: 45 },
  { month: 'Jan', absences: 55, lates: 38 },
]

const candidatures: ICandidature[] = [
  { time: '2h', name: 'Marie Dupont', type: 'Professeur', status: 'En attente' },
  { time: '5h', name: 'Jean Martin', type: 'Élève', status: 'En attente' },
  { time: '1j', name: 'Sophie Bernard', type: 'Professeur', status: 'En attente' },
  { time: '2j', name: 'Lucas Petit', type: 'Élève', status: 'En attente' },
  { time: '2j', name: 'Emma Dubois', type: 'Élève', status: 'En attente' },
]

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
    .from('students') // TODO: use 'student_school_class' table in future
    .select('*', { count: 'estimated' })
    .eq('school_id', schoolId)
    // TODO: Use this ==> .eq('status', 'active') and filter by school_year_id too

  if (error) {
    console.error('Error fetching student population:', error.message)
    return { total: 0, yearOverYearGrowth: 0 }
  }

  return { total: count || 0, yearOverYearGrowth: 15 } // TODO: implement yearOverYearGrowth calculation
}

async function getStudentFiles(client: SupabaseClient, schoolId: string): Promise<{ pendingApplications: number, withoutParent: number, withoutClass: number }> {
  const pendingApplicationsQs = 0 // TODO: Implement this after your will create 'student_school_class' table
  const withoutParentQs = client.from('students').select('id', { count: 'estimated' }).eq('school_id', schoolId).is('parent_id', null)
  const withoutClassQs = client.from('students').select('id', { count: 'estimated' }).eq('school_id', schoolId).is('class_id', null)

  const [
    // { count: pendingApplications, error: pendingApplicationsError },
    { count: withoutParent, error: withoutParentError },
    { count: withoutClass, error: withoutClassError },
  ] = await Promise.all([
    // pendingApplicationsQs,
    withoutParentQs,
    withoutClassQs,
  ])

  // if (pendingApplicationsError || withoutParentError || withoutClassError) {
  if (withoutParentError || withoutClassError) {
    // console.error('Error fetching student files:', pendingApplicationsError?.message, withoutParentError?.message, withoutClassError?.message)
    console.error('Error fetching student files:', withoutParentError?.message, withoutClassError?.message)
    return { pendingApplications: 0, withoutParent: 0, withoutClass: 0 }
  }

  return { pendingApplications: pendingApplicationsQs, withoutParent: withoutParent ?? 0, withoutClass: withoutClass ?? 0 }
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

  // Query for teacher assignments (need actual data for deduplication)
  const withoutClassQs = client.from('teacher_class_assignments')
    .select('teacher_id')
    .eq('school_id', schoolId)

  const [
    { count: pendingApplications, error: pendingApplicationsError },
    { count: schoolTeachers, error: schoolTeachersError },
    { data: assignmentsData, error: withoutClassError },
  ] = await Promise.all([
    pendingApplicationsQs,
    schoolTeacherCountQs,
    withoutClassQs,
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

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    const supabase = createClient()

    const userId = await checkAuthUserId(supabase)
    const schoolId = await getDirectorSchoolId(supabase, userId)

    const studentPopulation = await getStudentPopulation(supabase, schoolId)
    const studentFiles = await getStudentFiles(supabase, schoolId)
    const teachingStaff = await getTeachingStaff(supabase, schoolId)

    return { ...metrics, studentPopulation, studentFiles, teachingStaff }
  }

  static async getPonctualiteData(): Promise<IPonctualite[]> {
    await delay(1000)
    if (simulateError()) {
      throw new Error('Failed to fetch ponctualite data')
    }
    return ponctualiteData
  }

  static async getCandidatures(): Promise<ICandidature[]> {
    await delay(600)
    if (simulateError()) {
      throw new Error('Failed to fetch candidatures')
    }
    return candidatures
  }

  static async getNotes(): Promise<IGradeNote[]> {
    const supabase = createClient()
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

  static async publishNote(noteId: string): Promise<void> {
    const supabase = createClient()

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

  static async handleCandidature(action: 'accept' | 'reject'): Promise<void> {
    await delay(500)
    if (simulateError()) {
      throw new Error(`Failed to ${action} candidature`)
    }
    // Simulated success (in real app, this would make an API call)
  }
}
