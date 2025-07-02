'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import type { ILessonProgressReport, ILessonProgressReportConfig } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { extractCompositeKey } from '@/lib/utils'
import { ERole } from '@/types'
import { getUserId } from './userService'

export type LessonProgressReportConfig = Database['public']['Tables']['lessons_progress_reports_config']['Row']
export type LessonProgressReportConfigInsert = Database['public']['Tables']['lessons_progress_reports_config']['Insert']
export type LessonProgressReportConfigInsertWithErrorKeys = LessonProgressReportConfigInsert & {
  errorKey: {
    gradeName: string
    subjectName: string
  }
}
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

interface GetProgressReportsParams {
  filters?: {
    gradeId?: number
    subjectId?: string
    schoolYearId?: number
    series?: string
    classId?: string
    isCompleted?: boolean
  }
  page?: number
  limit?: number
  sortBy?: LessonProgressReportSortKeys
  ascending?: boolean
}

// Define a type for sorting keys that could be on the report or its config
// This should align with the keys available in ILessonProgressReport and conceptually sortable fields
export type LessonProgressReportSortKeys =
  | keyof LessonProgressReport
  | `config.${keyof LessonProgressReportConfig}`
  | 'config.grade.name'
  | 'config.subject.name'
  | 'level'
  | 'id'
  | 'createdAt'
  | 'startedAt'
  | 'updatedAt'
  | 'completedAt'
  | 'isCompleted'
  | 'sessionsCompleted'
  | 'classId'
  | 'config.id'
  | 'config.level'
  | 'config.subjectName'
  | 'config.lessonOrder'
  | 'config.sessionsCount'

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

export async function importLessonsProgressReportsConfig(reports: LessonProgressReportConfigInsertWithErrorKeys[]): Promise<{ successCount: number, errors: { row: number, error: string }[] }> {
  const supabase = await createClient()
  const schoolId = await checkAuthAndGetSchoolId(supabase)

  const reportsWithSchoolId = reports.map(report => ({
    school_id: schoolId,
    grade_id: report.grade_id,
    lesson: report.lesson,
    lesson_order: report.lesson_order,
    school_year_id: report.school_year_id,
    series: report.series,
    sessions_count: report.sessions_count,
    subject_id: report.subject_id,
  } satisfies LessonProgressReportConfigInsert))

  const { data, error } = await supabase
    .from('lessons_progress_reports_config')
    .insert(reportsWithSchoolId)
    .select()

  let successCount = 0
  const errors: { row: number, error: string }[] = []

  if (error) {
    if (error.code === '23505' && error.message.includes('lprc_unique_config')) { // Unique constraint violation
      const compositeKey = extractCompositeKey(error.details, ['grade_id', 'subject_id', 'school_year_id', 'school_id', 'series', 'lesson_order'])
      const errorRow = reports.findIndex(report => report.subject_id === compositeKey?.subject_id && report.grade_id === compositeKey?.grade_id && report.school_year_id === compositeKey?.school_year_id && report.series === compositeKey?.series && report.lesson_order === compositeKey?.lesson_order)
      const customErrorMessage = `=>L'ordre "${compositeKey?.lesson_order}"<= de leçon pour la matière "${reports[errorRow].errorKey.subjectName}" et du niveau "${reports[errorRow].errorKey.gradeName} ${reports[errorRow].series ?? ''}" est déjà utilisé. Veuillez vérifier le fichier importé et réessayer.`

      errors.push({ row: errorRow, error: customErrorMessage })
    }
    else {
      errors.push({ row: 0, error: `Erreur lors de l'import de la configuration de progression de cours: ${error.message}. Veuillez vérifier le fichier importé et réessayer.` })
    }
  }
  else {
    successCount = data?.length || 0
  }

  return { successCount, errors }
}

export async function getLessonsProgressReports(
  params: GetProgressReportsParams,
): Promise<{ data: ILessonProgressReport[], count: number | null }> {
  const supabase = await createClient()

  const { filters = {}, page = 1, limit = 10, sortBy = 'config.lessonOrder', ascending = true } = params
  const schoolId = await checkAuthAndGetSchoolId(supabase)

  const from = (page - 1) * limit
  const to = from + limit - 1

  const selectStatement = `
    id,
    class_id,
    created_at,
    is_completed,
    sessions_completed,
    started_at,
    updated_at,
    completed_at,
    classroom: classes( name ),
    config: lessons_progress_reports_config!inner (
      id,
      lesson,
      lesson_order,
      sessions_count,
      series,
      grade: grades ( name ),
      subject: subjects ( name ),
      school_year: school_years ( academic_year_name ),
      school_id,
      grade_id,
      subject_id,
      school_year_id
    )
  `

  let query = supabase
    .from('lessons_progress_reports')
    .select(selectStatement, { count: 'exact' })

    .eq('config.school_id', schoolId)

  // Apply filters targeting the main 'lessons_progress_reports' table
  if (typeof filters.isCompleted === 'boolean')
    query = query.eq('is_completed', filters.isCompleted)
  if (filters.classId)
    query = query.eq('class_id', filters.classId)

  // Apply filters targeting the related 'lessons_progress_reports_config' table
  if (filters.gradeId !== undefined)
    query = query.eq('config.grade_id', filters.gradeId)
  if (filters.subjectId !== undefined)
    query = query.eq('config.subject_id', filters.subjectId)
  if (filters.schoolYearId !== undefined)
    query = query.eq('config.school_year_id', filters.schoolYearId)
  if (filters.series !== undefined)
    query = query.eq('config.series', filters.series)

  // --- Apply Sorting ---
  let dbSortColumn: string
  const sortKey = sortBy as LessonProgressReportSortKeys // Type assertion for switch

  // Map the conceptual sortBy key (from ILessonProgressReport) to the actual database column path
  switch (sortKey) {
    // --- Fields on lessons_progress_reports ---
    case 'id': dbSortColumn = 'id'
      break
    case 'classId': dbSortColumn = 'class_id'
      break
    case 'createdAt': dbSortColumn = 'created_at'
      break
    case 'isCompleted': dbSortColumn = 'is_completed'
      break
    case 'sessionsCompleted': dbSortColumn = 'sessions_completed'
      break
    case 'startedAt': dbSortColumn = 'started_at'
      break
    case 'updatedAt': dbSortColumn = 'updated_at'
      break
    case 'completedAt': dbSortColumn = 'completed_at'
      break

    // --- Fields accessed via config relation ---
    case 'config.id': dbSortColumn = 'config(id)'
      break
    case 'config.lessonOrder': dbSortColumn = 'config(lesson_order)'
      break
    case 'config.sessionsCount': dbSortColumn = 'config(sessions_count)'
      break
    case 'config.lesson': dbSortColumn = 'config(lesson)'
      break
    case 'config.series': dbSortColumn = 'config(series)'
      break
    case 'config.grade_id': dbSortColumn = 'config(grade_id)'
      break
    case 'config.subject_id': dbSortColumn = 'config(subject_id)'
      break
    case 'config.school_year_id': dbSortColumn = 'config(school_year_id)'
      break
    case 'config.created_at': dbSortColumn = 'config(created_at)'
      break
    case 'config.updated_at': dbSortColumn = 'config(updated_at)'
      break

    // --- Conceptual/Nested Sorting (May require adjustments or proxy sorting) ---
    case 'config.level':
    case 'config.grade.name':
      // Direct sorting by related name might fail or be inefficient. Sort by ID as a proxy.
      dbSortColumn = 'config(grade_id)'
      console.warn('Sorting by \'level\' or \'config.grade.name\' might not produce exact alphabetical order. Sorting by grade_id as a proxy.')
      // For true name sorting, consider a database view or RPC.
      break
    case 'config.subjectName':
    case 'config.subject.name':
      dbSortColumn = 'config(subject_id)'
      console.warn('Sorting by \'config.subjectName\' or \'config.subject.name\' might not produce exact alphabetical order. Sorting by subject_id as a proxy.')
      break

    default:
      console.warn(`Unsupported sortBy key: '${sortKey}'. Defaulting to config.lesson_order.`)
      dbSortColumn = 'config(lesson_order)'
  }

  query = query.order(dbSortColumn, { ascending })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('Error fetching lesson progress reports:', error)

    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      throw new Error(`Erreur de base de données: La relation ${error.message.split('"')[1]} est introuvable. Vérifiez la structure de la requête.`)
    }
    if (error.message.includes('could not identify an ordering operator') || error.message.includes('order operator')) {
      throw new Error(`Erreur de tri: Impossible de trier par la colonne '${dbSortColumn}'. Vérifiez le type de données ou la structure de la requête. Détails: ${error.message}`)
    }
    throw new Error(`Erreur lors de la récupération des rapports de progression: ${error.message}`)
  }

  return {
    data: data
      ? data.map((d) => {
          const configData = d.config

          const series = configData?.series ?? ''
          const subjectName = configData?.subject?.name ?? 'N/A'
          const level = `${d.classroom.name} ${series}`.trim()

          if (!configData) {
            console.error(`Inconsistent state: Progress report ${d.id} missing config despite inner join.`)

            return {
              id: d.id,
              config: { id: 'error', level: 'Error', subjectName: 'Error', lessonOrder: 0, sessionsCount: 0, lesson: 'Error' },
              classId: d.class_id,
              createdAt: d.created_at,
              isCompleted: d.is_completed,
              sessionsCompleted: d.sessions_completed,
              startedAt: d.started_at,
              updatedAt: d.updated_at,
              completedAt: d.completed_at,
            } satisfies ILessonProgressReport
          }

          return {
            id: d.id,
            config: {
              id: configData.id,
              level,
              subjectName,
              lessonOrder: configData.lesson_order,
              sessionsCount: configData.sessions_count,
              lesson: configData.lesson ?? 'N/A',
            },
            classId: d.class_id,
            createdAt: d.created_at,
            isCompleted: d.is_completed,
            sessionsCompleted: d.sessions_completed,
            startedAt: d.started_at,
            updatedAt: d.updated_at,
            completedAt: d.completed_at,
          } satisfies ILessonProgressReport
        })
      : [],
    count,
  }
}
