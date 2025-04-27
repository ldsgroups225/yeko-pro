'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import type { ILessonProgressReportConfig } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'
import { getUserId } from './userService'

export type LessonProgressReportConfig = Database['public']['Tables']['lessons_progress_reports_config']['Row']
export type LessonProgressReportConfigInsert = Database['public']['Tables']['lessons_progress_reports_config']['Insert']
export type LessonProgressReportConfigUpdate = Database['public']['Tables']['lessons_progress_reports_config']['Update']

export type LessonProgressReport = Database['public']['Tables']['lessons_progress_reports']['Row']
export type LessonProgressReportInsert = Database['public']['Tables']['lessons_progress_reports']['Insert']
export type LessonProgressReportUpdate = Database['public']['Tables']['lessons_progress_reports']['Update']

// --- Helper Functions ---
async function checkAuthAndGetSchoolId(client: SupabaseClient): Promise<string> {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('Non autorisé : Utilisateur non authentifié. Veuillez vous connecter.')
  }

  const { data: userSchool, error } = await client
    .from('users')
    .select('school_id, user_roles!inner(role_id)')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()

  if (error) {
    console.error('Erreur d\'autorisation:', error)
    throw new Error(`Erreur d'autorisation : ${error.message}. Veuillez vérifier vos droits d'accès.`)
  }
  if (!userSchool?.school_id) {
    throw new Error('Vous n\'êtes pas associé à un établissement scolaire valide. Veuillez contacter l\'administrateur de la plateforme.')
  }
  return userSchool.school_id
}

// --- Main Service Functions ---

interface GetProgressReportsConfigParams {
  schoolId: string
  filters?: {
    gradeId?: number
    subjectId?: string
    schoolYearId?: number
    series?: string
  }
  page?: number
  limit?: number
  sortBy?: keyof ILessonProgressReportConfig
  ascending?: boolean
}

// interface GetProgressReportsParams {
//   schoolId: string
//   filters?: {
//     gradeId?: number
//     subjectId?: string
//     schoolYearId?: number
//     series?: string
//     isCompleted?: boolean
//   }
//   page?: number
//   limit?: number
//   sortBy?: keyof ILessonProgressReport
//   ascending?: boolean
// }

export async function getLessonsProgressReportsConfig(
  params: GetProgressReportsConfigParams,
): Promise<{ data: ILessonProgressReportConfig[], count: number | null }> {
  const supabase = await createClient()
  const { filters = {}, page = 1, limit = 10, sortBy = 'lesson_order', ascending = true } = params
  const schoolId = await checkAuthAndGetSchoolId(supabase)

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('lessons_progress_reports_config')
    .select(`
        *,
        grade: grades ( name ),
        subject: subjects ( name ),
        school_year: school_years ( academic_year_name )
      `, { count: 'exact' })
    .eq('school_id', schoolId)

  // Apply filters
  if (filters.gradeId)
    query = query.eq('grade_id', filters.gradeId)
  if (filters.subjectId)
    query = query.eq('subject_id', filters.subjectId)
  if (filters.schoolYearId)
    query = query.eq('school_year_id', filters.schoolYearId)
  if (filters.series)
    query = query.eq('series', filters.series)

  query = query.order(sortBy, { ascending })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Erreur lors de la récupération de la configuration de progression de cours:', error)
    throw new Error('Impossible de récupérer la configuration de progression des cours. Veuillez vérifier votre connexion internet et réessayer.')
  }

  return {
    data: data
      ? data.map(d => ({
          id: d.id,
          level: `${d.grade.name} ${d.series ?? ''}`.trim(),
          subjectId: d.subject_id,
          subjectName: d.subject.name,
          lesson: d.lesson,
          lessonOrder: d.lesson_order,
          series: d.series,
          sessionsCount: d.sessions_count,
          isCompleted: false, // d.is_completed,
          sessionsCompleted: 0, // d.sessions_completed,
          completedAt: null, // d.completed_at,
          gradeId: d.grade_id,
          schoolYearId: d.school_year_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }))
      : [],
    count,
  }
}

export async function createLessonProgressReportConfig(
  reportData: Omit<LessonProgressReportConfigInsert, 'school_id' | 'id' | 'created_at' | 'updated_at' | 'is_completed' | 'sessions_completed' | 'completed_at'>,
): Promise<ILessonProgressReportConfig> {
  const supabase = await createClient()
  const schoolId = await checkAuthAndGetSchoolId(supabase)

  const { data, error } = await supabase
    .from('lessons_progress_reports_config')
    .insert({ ...reportData, school_id: schoolId })
    .select('*, grade: grades ( name ), subject: subjects ( name )')
    .single()

  if (error) {
    console.error('Erreur lors de la création de la configuration de progression de cours:', error)
    // Handle specific errors like unique constraint violation
    if (error.code === '23505') { // Unique violation code in PostgreSQL
      throw new Error('Une configuration de progression pour cette leçon, matière et classe existe déjà pour cette année scolaire. Veuillez vérifier les données saisies.')
    }
    throw new Error('Erreur lors de la création de la configuration de progression de cours. Veuillez vérifier les informations fournies.')
  }
  return {
    id: data.id,
    level: `${data.grade.name} ${data.series ?? ''}`.trim(),
    subjectId: data.subject_id,
    subjectName: data.subject.name,
    lesson: data.lesson,
    lessonOrder: data.lesson_order,
    series: data.series,
    sessionsCount: data.sessions_count,
    gradeId: data.grade_id,
    schoolYearId: data.school_year_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } satisfies ILessonProgressReportConfig
}

export async function updateLessonProgressReportConfig(
  id: string,
  updateData: LessonProgressReportConfigUpdate,
): Promise<ILessonProgressReportConfig> {
  const supabase = await createClient()
  await checkAuthAndGetSchoolId(supabase)

  // Ensure sensitive fields are not updated directly if needed
  const updatePayload = { ...updateData, updated_at: new Date().toISOString() }
  delete updatePayload.id
  delete updatePayload.created_at
  delete updatePayload.school_id

  const { data, error } = await supabase
    .from('lessons_progress_reports_config')
    .update(updatePayload)
    .eq('id', id)
    .select('*, grade: grades ( name ), subject: subjects ( name )')
    .single()

  if (error) {
    console.error('Erreur lors de la mise à jour de la configuration de progression de cours:', error)
    throw new Error('Erreur lors de la mise à jour de la configuration de progression de cours. Veuillez vérifier les données modifiées.')
  }
  return {
    id: data.id,
    level: `${data.grade.name} ${data.series ?? ''}`.trim(),
    subjectId: data.subject_id,
    subjectName: data.subject.name,
    lesson: data.lesson,
    lessonOrder: data.lesson_order,
    series: data.series,
    sessionsCount: data.sessions_count,
    gradeId: data.grade_id,
    schoolYearId: data.school_year_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } satisfies ILessonProgressReportConfig
}

export async function deleteLessonProgressReportConfig(id: string): Promise<void> {
  const supabase = await createClient()
  await checkAuthAndGetSchoolId(supabase)

  const { error } = await supabase
    .from('lessons_progress_reports_config')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erreur lors de la suppression de la configuration de progression de cours:', error)
    throw new Error('Erreur lors de la suppression de la configuration de progression de cours. Veuillez contacter l\'administrateur si le problème persiste.')
  }
}

export async function importLessonsProgressReportsConfig(reports: LessonProgressReportConfigInsert[]): Promise<{ successCount: number, errors: { row: number, error: string }[] }> {
  const supabase = await createClient()
  const schoolId = await checkAuthAndGetSchoolId(supabase)

  const reportsWithSchoolId = reports.map(report => ({
    ...report,
    school_id: schoolId,
  }))

  const { data, error } = await supabase
    .from('lessons_progress_reports_config')
    .insert(reportsWithSchoolId)
    .select() // Select to get results, though bulk insert might not return detailed errors per row easily

  let successCount = 0
  const errors: { row: number, error: string }[] = []

  if (error) {
    console.error('Erreur lors de l\'import de la configuration de progression de cours:', error)
    // Basic error reporting for bulk insert
    errors.push({ row: 0, error: `Erreur lors de l'import de la configuration de progression de cours: ${error.message}. Veuillez vérifier le fichier importé et réessayer.` })
    // Depending on the error, maybe only some rows failed.
    // Supabase might not return individual row errors on bulk insert failure easily.
    // For detailed row errors, consider inserting one by one or using a different approach.
  }
  else {
    successCount = data?.length || 0 // Assuming success if no error
  }

  return { successCount, errors }
}

// export const progress = {
//   async getLessonsProgressReportsConfig(
//     params: GetProgressReportsParams,
//   ): Promise<{ data: ILessonProgressReportConfig[], count: number | null }> {
//     const supabase = await createClient()
//     const { filters = {}, page = 1, limit = 10, sortBy = 'lesson_order', ascending = true } = params
//     const schoolId = await checkAuthAndGetSchoolId(supabase)

//     const from = (page - 1) * limit
//     const to = from + limit - 1

//     let query = supabase
//       .from('lessons_progress_reports_config')
//       .select(`
//       *,
//       grade: grades ( name ),
//       subject: subjects ( name ),
//       school_year: school_years ( academic_year_name )
//     `, { count: 'exact' })
//       .eq('school_id', schoolId)

//     // Apply filters
//     if (filters.gradeId)
//       query = query.eq('grade_id', filters.gradeId)
//     if (filters.subjectId)
//       query = query.eq('subject_id', filters.subjectId)
//     if (filters.schoolYearId)
//       query = query.eq('school_year_id', filters.schoolYearId)
//     if (filters.series)
//       query = query.eq('series', filters.series)
//     if (typeof filters.isCompleted === 'boolean')
//       query = query.eq('is_completed', filters.isCompleted)

//     query = query.order(sortBy, { ascending })

//     const { data, error, count } = await query.range(from, to)

//     if (error) {
//       console.error('Error fetching lesson progress reports:', error)
//       throw new Error('Erreur lors de la récupération des rapports de progression.')
//     }

//     // export interface ILessonProgressReportConfig {
//     //   createdAt: string
//     //   lessonOrder: number
//     //   schoolId: string
//     //   series: string | null
//     //   sessionsCount: number
//     //   subjectId: string
//     //   updatedAt: string
//     // }

//     return {
//       data: data
//         ? data.map(d => ({
//             id: d.id,
//             gradeId: d.grade_id,
//             subjectId: d.subject_id,
//             subjectName: d.subject.name,
//             lesson: d.lesson,
//             lessonOrder: d.lesson_order,
//             series: d.series,
//             sessionsCount: d.sessions_count,
//             isCompleted: false, // d.is_completed,
//             sessionsCompleted: 0, // d.sessions_completed,
//             completedAt: null, // d.completed_at,
//             createdAt: d.created_at,
//             updatedAt: d.updated_at,
//           }))
//         : [],
//       count,
//     }
//   },
// }
