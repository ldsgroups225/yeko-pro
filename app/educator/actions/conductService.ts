'use server'

import type { IConductQueryParams, IConductStats, IConductStudent } from '../types'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export interface ConductRecord {
  id: number
  student: string
  class: string
  issue: string
  severity: 'Mineur' | 'Modéré' | 'Sévère'
  date: string
}

// Helper functions for authentication
async function checkAuthUserId(client: any): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

async function getUserSchoolId(client: any, userId: string): Promise<string> {
  const { data: userSchool, error: userSchoolError } = await client
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', userId)
    .single()

  if (userSchoolError) {
    console.error('Error fetching user school:', userSchoolError)
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }

  if (!userSchool.school_id) {
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }

  return userSchool.school_id
}

// Cached function for educator conduct students with filtering and pagination
export const getEducatorConductStudents = cache(async (params: IConductQueryParams = {}): Promise<{
  students: IConductStudent[]
  totalCount: number
  stats: IConductStats
}> => {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)

  // Get current school year and semester for default values
  const [
    schoolId,
    { data: currentSchoolYear },
    { data: currentSemester },
  ] = await Promise.all([
    getUserSchoolId(supabase, userId),
    supabase
      .from('school_years')
      .select('id')
      .eq('is_current', true)
      .single(),
    supabase
      .from('semesters')
      .select('id')
      .eq('is_current', true)
      .single(),
  ])

  const {
    page = 1,
    limit = 12,
    searchTerm,
    classId,
    gradeFilter,
    scoreRange,
    sort = { column: 'last_name', direction: 'asc' },
  } = params

  if (!currentSchoolYear || !currentSemester) {
    throw new Error('Aucune année scolaire ou semestre en cours trouvée')
  }

  // Use the student_conduct_summary_view for efficient querying
  let query = supabase
    .from('student_conduct_summary_view')
    .select('*', { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('school_year_id', currentSchoolYear.id)
    .eq('semester_id', currentSemester.id)

  // Apply filters
  if (searchTerm) {
    query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
  }

  if (classId) {
    query = query.eq('class_id', classId)
  }

  if (gradeFilter) {
    query = query.eq('grade', gradeFilter)
  }

  if (scoreRange) {
    query = query.gte('total_score', scoreRange.min).lte('total_score', scoreRange.max)
  }

  // Get total count first
  const { count: totalCount } = await query

  // Apply pagination and sorting
  const offset = (page - 1) * limit
  const sortColumn = sort.column === 'lastName'
    ? 'last_name'
    : sort.column === 'firstName'
      ? 'first_name'
      : sort.column === 'totalScore' ? 'total_score' : sort.column

  query = query
    .order(sortColumn, { ascending: sort.direction === 'asc' })
    .range(offset, offset + limit - 1)

  const { data: studentsData, error } = await query

  if (error) {
    console.error('Error fetching students from view:', error)
    throw new Error('Erreur lors du chargement des étudiants')
  }

  // Get recent incidents for all students in batch
  const studentIds = (studentsData || [])
    .map(s => s.student_id)
    .filter((id): id is string => Boolean(id))

  const { data: recentIncidentsData } = await supabase
    .from('conduct_incidents')
    .select(`
      id,
      student_id,
      category_id,
      description,
      points_deducted,
      reported_at,
      conduct_categories(name, color)
    `)
    .in('student_id', studentIds)
    .eq('school_year_id', currentSchoolYear.id)
    .eq('semester_id', currentSemester.id)
    .eq('is_active', true)
    .gte('reported_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('reported_at', { ascending: false })

  // Group incidents by student
  const incidentsByStudent = (recentIncidentsData || []).reduce((acc, incident) => {
    if (!acc[incident.student_id]) {
      acc[incident.student_id] = []
    }
    acc[incident.student_id].push({
      id: incident.id,
      studentId: incident.student_id,
      categoryId: incident.category_id,
      description: incident.description,
      pointsDeducted: incident.points_deducted,
      reportedBy: '', // Not needed for recent incidents display
      reportedAt: incident.reported_at,
      schoolYearId: currentSchoolYear.id,
      semesterId: currentSemester.id,
      isActive: true,
      createdAt: incident.reported_at,
      updatedAt: incident.reported_at,
    })
    return acc
  }, {} as Record<string, any[]>)

  // Transform the view data to match our interface
  const students: IConductStudent[] = (studentsData || []).map(student => ({
    id: student.student_id || '',
    firstName: student.first_name || '',
    lastName: student.last_name || '',
    idNumber: student.id_number || '',
    avatarUrl: student.avatar_url || '',
    className: student.class_name || '',
    classId: student.class_id || '',
    currentScore: {
      id: student.student_id || '',
      studentId: student.student_id || '',
      schoolYearId: currentSchoolYear.id,
      semesterId: currentSemester.id,
      attendanceScore: student.attendance_score || 6,
      dresscodeScore: student.dresscode_score || 3,
      moralityScore: student.morality_score || 4,
      disciplineScore: student.discipline_score || 7,
      totalScore: student.total_score || 20,
      grade: (student.grade || 'TRES_BONNE') as 'BLAME' | 'MAUVAISE' | 'PASSABLE' | 'BONNE' | 'TRES_BONNE',
      lastUpdated: student.last_updated || new Date().toISOString(),
    },
    recentIncidents: incidentsByStudent[student.student_id || ''] || [],
    attendanceStats: {
      totalSessions: student.total_sessions || 0,
      absences: student.absences || 0,
      lates: student.lates || 0,
      attendanceRate: student.attendance_rate || 100,
    },
  }))

  // Get statistics from the conduct_stats_view and calculate additional metrics
  const [
    { data: statsData },
    { count: recentIncidentsCount },
    { data: previousStats },
  ] = await Promise.all([
    supabase
      .from('conduct_stats_view')
      .select('*')
      .eq('school_id', schoolId)
      .eq('school_year_id', currentSchoolYear.id)
      .eq('semester_id', currentSemester.id)
      .single(),
    supabase
      .from('conduct_incidents')
      .select('id', { count: 'exact' })
      .eq('school_year_id', currentSchoolYear.id)
      .eq('semester_id', currentSemester.id)
      .eq('is_active', true)
      .gte('reported_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()), // Last 7 days
    supabase
      .from('conduct_stats_view')
      .select('average_score')
      .eq('school_year_id', currentSchoolYear.id)
      .lt('semester_id', currentSemester.id)
      .order('semester_id', { ascending: false })
      .limit(1)
      .single(),
  ])

  // Calculate improvement trend (comparing current vs previous semester)
  const currentAverage = statsData?.average_score || 0
  const previousAverage = previousStats?.average_score || currentAverage
  const improvementTrend = previousAverage > 0
    ? ((currentAverage - previousAverage) / previousAverage) * 100
    : 0

  const stats: IConductStats = {
    excellenceRate: statsData?.excellence_rate || 0,
    totalStudents: totalCount || 0,
    averageScore: currentAverage,
    gradeDistribution: {
      BLAME: statsData?.blame_count || 0,
      MAUVAISE: statsData?.mauvaise_count || 0,
      PASSABLE: statsData?.passable_count || 0,
      BONNE: statsData?.bonne_count || 0,
      TRES_BONNE: statsData?.tres_bonne_count || 0,
    },
    recentIncidents: recentIncidentsCount || 0,
    improvementTrend: Math.round(improvementTrend * 10) / 10, // Round to 1 decimal place
  }

  return {
    students,
    totalCount: totalCount || 0,
    stats,
  }
})

// Cached function for educator conduct statistics
export const getEducatorConductStats = cache(async (): Promise<IConductStats> => {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  const schoolId = await getUserSchoolId(supabase, userId)

  // Get current school year and semester
  const { data: currentSchoolYear } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  const { data: currentSemester } = await supabase
    .from('semesters')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentSchoolYear || !currentSemester) {
    throw new Error('Aucune année scolaire ou semestre actuel trouvé')
  }

  // Get total students count from active enrollments
  const { count: totalStudents } = await supabase
    .from('student_school_class')
    .select('student_id', { count: 'exact' })
    .eq('school_id', schoolId)
    .eq('school_year_id', currentSchoolYear.id)
    .eq('is_active', true)
    .not('class_id', 'is', null)

  // Get statistics from the conduct_stats_view
  const { data: statsData } = await supabase
    .from('conduct_stats_view')
    .select('*')
    .eq('school_id', schoolId)
    .eq('school_year_id', currentSchoolYear.id)
    .eq('semester_id', currentSemester.id)
    .single()

  // Get recent incidents count
  const { count: recentIncidentsCount } = await supabase
    .from('conduct_incidents')
    .select('id', { count: 'exact' })
    .eq('school_year_id', currentSchoolYear.id)
    .eq('semester_id', currentSemester.id)
    .eq('is_active', true)

  // Calculate improvement trend (simplified - comparing current vs previous period)
  const { data: previousStats } = await supabase
    .from('conduct_stats_view')
    .select('average_score, excellence_rate')
    .eq('school_year_id', currentSchoolYear.id)
    .lt('semester_id', currentSemester.id)
    .order('semester_id', { ascending: false })
    .limit(1)
    .single()

  const currentAverage = statsData?.average_score || 0
  const previousAverage = previousStats?.average_score || currentAverage
  const improvementTrend = previousAverage > 0
    ? ((currentAverage - previousAverage) / previousAverage) * 100
    : 0

  return {
    excellenceRate: statsData?.excellence_rate || 0,
    totalStudents: totalStudents || 0,
    averageScore: currentAverage,
    gradeDistribution: {
      BLAME: statsData?.blame_count || 0,
      MAUVAISE: statsData?.mauvaise_count || 0,
      PASSABLE: statsData?.passable_count || 0,
      BONNE: statsData?.bonne_count || 0,
      TRES_BONNE: statsData?.tres_bonne_count || 0,
    },
    recentIncidents: recentIncidentsCount || 0,
    improvementTrend: Math.round(improvementTrend * 10) / 10,
  }
})

// Cached function for classes filter
export const getEducatorClassesForFilter = cache(async (): Promise<{ id: string, name: string }[]> => {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  const schoolId = await getUserSchoolId(supabase, userId)

  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching classes:', error)
    throw new Error('Erreur lors du chargement des classes')
  }

  return classes || []
})

// Legacy function for backward compatibility
export const getRecentConducts = cache(async (): Promise<ConductRecord[]> => {
  try {
    const { students } = await getEducatorConductStudents({ limit: 10 })

    // Transform to legacy format
    return students.map(student => ({
      id: Number.parseInt(student.id),
      student: `${student.firstName} ${student.lastName}`,
      class: student.className,
      issue: student.recentIncidents.length > 0
        ? student.recentIncidents[0].description
        : 'Aucun incident récent',
      severity: student.currentScore.grade === 'TRES_BONNE' || student.currentScore.grade === 'BONNE'
        ? 'Mineur'
        : student.currentScore.grade === 'PASSABLE'
          ? 'Modéré'
          : 'Sévère',
      date: student.recentIncidents.length > 0
        ? new Date(student.recentIncidents[0].reportedAt).toLocaleDateString('fr-FR')
        : new Date().toLocaleDateString('fr-FR'),
    }))
  }
  catch (error) {
    console.error('Error fetching recent conducts:', error)
    return []
  }
})
