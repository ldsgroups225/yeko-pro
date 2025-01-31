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

export class DashboardService {
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    await delay(800) // Simulate network delay
    if (simulateError()) {
      throw new Error('Failed to fetch dashboard metrics')
    }
    return metrics
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

    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
    }

    const { data: userSchool, error: userSchoolError } = await supabase
      .from('users')
      .select('school_id, user_roles(role_id)')
      .eq('id', user.user.id)
      .eq('user_roles.role_id', ERole.DIRECTOR)
      .single()
    if (userSchoolError) {
      console.error('Error fetching user school:', userSchoolError)
      throw new Error('Seul un directeur peut accéder à cette page')
    }

    if (!userSchool.school_id) {
      throw new Error('Utilisateur non associé à un établissement scolaire')
    }
    const schoolId = userSchool.school_id

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
    const { data: user, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error fetching user:', userError)
      throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
    }

    const { error: userSchoolError } = await supabase
      .from('users')
      .select('user_roles(role_id)')
      .eq('id', user.user.id)
      .eq('user_roles.role_id', ERole.DIRECTOR)
      .single()
    if (userSchoolError) {
      console.error('Error fetching user school:', userSchoolError)
      throw new Error('Seul un directeur peut accéder à cette page')
    }

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
