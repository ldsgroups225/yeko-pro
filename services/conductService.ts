'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { IConductIncident, IConductQueryParams, IConductScore, IConductStats, IConductStudent } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'
import { calculateConductGrade, CONDUCT_DEDUCTIONS } from '@/types/conduct'

/**
 * Retrieves the authenticated user's ID and validates authorization
 */
async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

/**
 * Retrieves the school ID associated with the authenticated user
 */
async function getUserSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error: userSchoolError } = await client
    .from('user_roles')
    .select('school_id')
    .eq('user_id', userId)
    .eq('role_id', ERole.DIRECTOR)
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

/**
 * Updates conduct scores after creating an incident
 */
async function updateConductScoresAfterIncident(
  client: SupabaseClient,
  studentId: string,
  schoolYearId: number,
  semesterId: number,
  // categoryId: string,
  // pointsDeducted: number,
): Promise<void> {
  // Get existing conduct score or create default values
  const { data: categoryIncidents } = await client
    .from('conduct_incidents')
    .select('category_id, points_deducted')
    .eq('student_id', studentId)
    .eq('school_year_id', schoolYearId)
    .eq('semester_id', semesterId)
    .eq('is_active', true)

  // Group incidents by category and sum points
  const categoryTotals = (categoryIncidents || []).reduce((acc, incident) => {
    acc[incident.category_id] = (acc[incident.category_id] || 0) + incident.points_deducted
    return acc
  }, {} as Record<string, number>)

  // Calculate new scores based on category maximums minus deductions
  const attendanceScore = Math.max(0, 6 - (categoryTotals.attendance || 0))
  const dresscodeScore = Math.max(0, 3 - (categoryTotals.dresscode || 0))
  const moralityScore = Math.max(0, 4 - (categoryTotals.morality || 0))
  const disciplineScore = Math.max(0, 7 - (categoryTotals.discipline || 0))

  const totalScore = attendanceScore + dresscodeScore + moralityScore + disciplineScore
  const grade = calculateConductGrade(totalScore)

  // Upsert the conduct score
  const { error } = await client
    .from('conduct_scores')
    .upsert({
      student_id: studentId,
      school_year_id: schoolYearId,
      semester_id: semesterId,
      attendance_score: attendanceScore,
      dresscode_score: dresscodeScore,
      morality_score: moralityScore,
      discipline_score: disciplineScore,
      grade,
    }, {
      onConflict: 'student_id,school_year_id,semester_id',
    })

  if (error) {
    console.error('Error updating conduct scores after incident:', error)
    throw new Error('Erreur lors de la mise à jour des scores de conduite')
  }
}

/**
 * Calculates attendance score based on attendance data
 */
async function calculateAttendanceScore(
  client: SupabaseClient,
  studentId: string,
  schoolYearId: number,
  semesterId: number,
): Promise<{ score: number, stats: { totalSessions: number, absences: number, lates: number, attendanceRate: number } }> {
  const { data: attendanceData, error } = await client
    .from('attendances')
    .select('status, starts_at, ends_at')
    .eq('student_id', studentId)
    .eq('school_years_id', schoolYearId)
    .eq('semesters_id', semesterId)

  if (error) {
    console.error('Error fetching attendance data:', error)
    return { score: 6, stats: { totalSessions: 0, absences: 0, lates: 0, attendanceRate: 100 } }
  }

  const totalSessions = attendanceData.length
  const absences = attendanceData.filter(a => a.status === 'absent').length
  const lates = attendanceData.filter(a => a.status === 'late').length

  // Calculate deductions based on ministry guidelines
  let deductions = 0

  // Deduct for absences (0.5 points per hour, assuming 1 hour sessions)
  // According to ministry document: "1 heure d'absence injustifiée entraîne le retrait de 0,5 point"
  deductions += absences * CONDUCT_DEDUCTIONS.UNJUSTIFIED_ABSENCE_HOUR

  // Additional deduction after 10 hours of absence
  if (absences >= 10) {
    deductions += CONDUCT_DEDUCTIONS.UNJUSTIFIED_ABSENCE_10H
  }

  // Note: Late arrival deductions are commented out as per ministry guidelines update
  // Original logic: deductions += Math.max(0, lates - 2) * CONDUCT_DEDUCTIONS.LATE_ARRIVAL

  const score = Math.max(0, 6 - deductions)
  const attendanceRate = totalSessions > 0 ? ((totalSessions - absences) / totalSessions) * 100 : 100

  return {
    score,
    stats: {
      totalSessions,
      absences,
      lates,
      attendanceRate,
    },
  }
}

/**
 * Fetches school information for the authenticated user
 */
export async function fetchSchoolInfo(): Promise<{
  id: string
  name: string
  code: string
  imageUrl?: string
  address?: string
  phone?: string
  email?: string
}> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  const schoolId = await getUserSchoolId(supabase, userId)

  const { data: schoolData, error } = await supabase
    .from('schools')
    .select('id, name, code, image_url, address, phone, email')
    .eq('id', schoolId)
    .single()

  if (error) {
    console.error('Error fetching school info:', error)
    throw new Error('Erreur lors du chargement des informations de l\'école')
  }

  return {
    id: schoolData.id,
    name: schoolData.name,
    code: schoolData.code,
    imageUrl: schoolData.image_url || undefined,
    address: schoolData.address || undefined,
    phone: schoolData.phone || undefined,
    email: schoolData.email || undefined,
  }
}

/**
 * Fetches conduct data for students with filtering and pagination
 */
export async function fetchConductStudents(params: IConductQueryParams): Promise<{
  students: IConductStudent[]
  totalCount: number
  stats: IConductStats
}> {
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
  }, {} as Record<string, IConductIncident[]>)

  // Transform the view data to match our interface
  const students: IConductStudent[] = (studentsData || []).map((student) => {
    // Calculate default scores if not present in database
    const attendanceScore = student.attendance_score ?? 6
    const dresscodeScore = student.dresscode_score ?? 3
    const moralityScore = student.morality_score ?? 4
    const disciplineScore = student.discipline_score ?? 7
    const totalScore = student.total_score ?? (attendanceScore + dresscodeScore + moralityScore + disciplineScore)
    const grade = student.grade as IConductScore['grade'] ?? calculateConductGrade(totalScore)

    const conductScore: IConductScore = {
      id: `${student.student_id}-conduct-score`,
      studentId: student.student_id!,
      schoolYearId: currentSchoolYear?.id || 0,
      semesterId: currentSemester?.id || 0,
      attendanceScore,
      dresscodeScore,
      moralityScore,
      disciplineScore,
      totalScore,
      grade,
      lastUpdated: student.last_updated || new Date().toISOString(),
    }

    return {
      id: student.student_id!,
      firstName: student.first_name!,
      lastName: student.last_name!,
      idNumber: student.id_number!,
      avatarUrl: student.avatar_url || undefined,
      className: student.class_name || 'Non assigné',
      classId: student.class_id || '',
      currentScore: conductScore,
      recentIncidents: incidentsByStudent[student.student_id!] || [],
      attendanceStats: {
        totalSessions: student.total_sessions || 0,
        absences: student.absences || 0,
        lates: student.lates || 0,
        attendanceRate: student.attendance_rate || 100,
      },
    }
  })

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
}

/**
 * Creates a new conduct incident
 */
export async function createConductIncident(incident: Omit<IConductIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<IConductIncident> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)

  // Verify user has permission to create incidents and get current school year/semester in parallel
  const [
    { data: userRole },
    { data: currentSchoolYear },
    { data: currentSemester },
  ] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .in('role_id', [ERole.DIRECTOR, ERole.EDUCATOR])
      .single(),
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

  if (!userRole || ![ERole.DIRECTOR, ERole.EDUCATOR].includes(userRole.role_id)) {
    throw new Error('Vous n\'avez pas l\'autorisation de créer des incidents de conduite')
  }

  if (!currentSchoolYear) {
    throw new Error('Aucune année scolaire active trouvée. Veuillez configurer l\'année scolaire courante.')
  }

  if (!currentSemester) {
    throw new Error('Aucun trimestre actif trouvé. Veuillez configurer le trimestre courant.')
  }

  // Insert the incident into the database
  const { data: insertedIncident, error } = await supabase
    .from('conduct_incidents')
    .insert({
      student_id: incident.studentId,
      category_id: incident.categoryId,
      description: incident.description,
      points_deducted: incident.pointsDeducted,
      reported_by: userId,
      reported_at: incident.reportedAt,
      school_year_id: currentSchoolYear.id,
      semester_id: currentSemester.id,
      is_active: incident.isActive,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conduct incident:', error)
    throw new Error('Erreur lors de la création de l\'incident de conduite')
  }

  // Transform the database result to match our interface
  const newIncident: IConductIncident = {
    id: insertedIncident.id,
    studentId: insertedIncident.student_id,
    categoryId: insertedIncident.category_id,
    description: insertedIncident.description,
    pointsDeducted: insertedIncident.points_deducted,
    reportedBy: insertedIncident.reported_by,
    reportedAt: insertedIncident.reported_at,
    schoolYearId: insertedIncident.school_year_id,
    semesterId: insertedIncident.semester_id,
    isActive: insertedIncident.is_active,
    createdAt: insertedIncident.created_at || new Date().toISOString(),
    updatedAt: insertedIncident.updated_at || new Date().toISOString(),
  }

  // Update or create conduct scores for the student after creating the incident
  try {
    await updateConductScoresAfterIncident(
      supabase,
      incident.studentId,
      currentSchoolYear.id,
      currentSemester.id,
      // incident.categoryId,
      // incident.pointsDeducted,
    )
  }
  catch (scoreError) {
    console.error('Error updating conduct scores after incident creation:', scoreError)
    // Don't throw here - the incident was created successfully,
    // we just log the score update error
  }

  return newIncident
}

/**
 * Fetches conduct statistics for dashboard
 */
export async function fetchConductStats(): Promise<IConductStats> {
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
    improvementTrend: Math.round(improvementTrend * 10) / 10, // Round to 1 decimal place
  }
}

/**
 * Updates or creates conduct scores for a student
 */
export async function upsertConductScore(
  studentId: string,
  schoolYearId: number,
  semesterId: number,
  scores: {
    attendanceScore?: number
    dresscodeScore?: number
    moralityScore?: number
    disciplineScore?: number
  },
): Promise<IConductScore> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)

  // Verify user has permission to update scores
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .single()

  if (!userRole || ![ERole.DIRECTOR, ERole.EDUCATOR].includes(userRole.role_id)) {
    throw new Error('Vous n\'avez pas l\'autorisation de modifier les notes de conduite')
  }

  // Calculate the grade based on total score (will be done by the database trigger)
  const totalScore = (scores.attendanceScore || 6)
    + (scores.dresscodeScore || 3)
    + (scores.moralityScore || 4)
    + (scores.disciplineScore || 7)

  const grade = calculateConductGrade(totalScore)

  // Upsert the conduct score
  const { data: upsertedScore, error } = await supabase
    .from('conduct_scores')
    .upsert({
      student_id: studentId,
      school_year_id: schoolYearId,
      semester_id: semesterId,
      attendance_score: scores.attendanceScore || 6,
      dresscode_score: scores.dresscodeScore || 3,
      morality_score: scores.moralityScore || 4,
      discipline_score: scores.disciplineScore || 7,
      grade,
    }, {
      onConflict: 'student_id,school_year_id,semester_id',
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting conduct score:', error)
    throw new Error('Erreur lors de la mise à jour de la note de conduite')
  }

  // Transform the database result to match our interface
  const conductScore: IConductScore = {
    id: upsertedScore.id,
    studentId: upsertedScore.student_id,
    schoolYearId: upsertedScore.school_year_id,
    semesterId: upsertedScore.semester_id,
    attendanceScore: upsertedScore.attendance_score,
    dresscodeScore: upsertedScore.dresscode_score,
    moralityScore: upsertedScore.morality_score,
    disciplineScore: upsertedScore.discipline_score,
    totalScore: upsertedScore.total_score || totalScore,
    grade: upsertedScore.grade as IConductScore['grade'],
    lastUpdated: upsertedScore.last_updated || new Date().toISOString(),
  }

  return conductScore
}

/**
 * Fetches recent conduct incidents
 */
export async function fetchRecentConductIncidents(limit: number = 10): Promise<IConductIncident[]> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  await getUserSchoolId(supabase, userId) // Verify user has school access

  const { data: incidentsData, error } = await supabase
    .from('recent_conduct_incidents_view')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching recent incidents:', error)
    throw new Error('Erreur lors du chargement des incidents récents')
  }

  // Transform the view data to match our interface
  const incidents: IConductIncident[] = (incidentsData || []).map(incident => ({
    id: incident.id!,
    studentId: incident.student_id!,
    categoryId: incident.category_id!,
    description: incident.description!,
    pointsDeducted: incident.points_deducted!,
    reportedBy: `${incident.reporter_first_name} ${incident.reporter_last_name}`,
    reportedAt: incident.reported_at!,
    schoolYearId: 0, // Not available in the view
    semesterId: 0, // Not available in the view
    isActive: true,
    createdAt: incident.reported_at!,
    updatedAt: incident.reported_at!,
  }))

  return incidents
}

/**
 * Fetches conduct incidents for a specific student
 */
export async function fetchStudentConductIncidents(
  studentId: string,
  schoolYearId?: number,
  semesterId?: number,
): Promise<IConductIncident[]> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  await getUserSchoolId(supabase, userId) // Verify user has school access

  let query = supabase
    .from('conduct_incidents')
    .select(`
      *,
      conduct_categories(name, color),
      users!conduct_incidents_reported_by_fkey(first_name, last_name)
    `)
    .eq('student_id', studentId)
    .eq('is_active', true)
    .order('reported_at', { ascending: false })

  if (schoolYearId) {
    query = query.eq('school_year_id', schoolYearId)
  }

  if (semesterId) {
    query = query.eq('semester_id', semesterId)
  }

  const { data: incidentsData, error } = await query

  if (error) {
    console.error('Error fetching student incidents:', error)
    throw new Error('Erreur lors du chargement des incidents de l\'étudiant')
  }

  // Transform the database result to match our interface
  const incidents: IConductIncident[] = (incidentsData || []).map(incident => ({
    id: incident.id,
    studentId: incident.student_id,
    categoryId: incident.category_id,
    description: incident.description,
    pointsDeducted: incident.points_deducted,
    reportedBy: incident.reported_by,
    reportedAt: incident.reported_at,
    schoolYearId: incident.school_year_id,
    semesterId: incident.semester_id,
    isActive: incident.is_active,
    createdAt: incident.created_at || new Date().toISOString(),
    updatedAt: incident.updated_at || new Date().toISOString(),
  }))

  return incidents
}

/**
 * Deactivates a conduct incident (soft delete)
 */
export async function deactivateConductIncident(incidentId: string): Promise<void> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)

  // Verify user has permission to deactivate incidents
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .single()

  if (!userRole || ![ERole.DIRECTOR, ERole.EDUCATOR].includes(userRole.role_id)) {
    throw new Error('Vous n\'avez pas l\'autorisation de supprimer des incidents de conduite')
  }

  // Get incident details before deactivating to update scores
  const { data: incident } = await supabase
    .from('conduct_incidents')
    .select('student_id, school_year_id, semester_id, category_id, points_deducted')
    .eq('id', incidentId)
    .single()

  const { error } = await supabase
    .from('conduct_incidents')
    .update({ is_active: false })
    .eq('id', incidentId)

  if (error) {
    console.error('Error deactivating conduct incident:', error)
    throw new Error('Erreur lors de la suppression de l\'incident de conduite')
  }

  // Update conduct scores after deactivating the incident
  if (incident) {
    try {
      await updateConductScoresAfterIncident(
        supabase,
        incident.student_id,
        incident.school_year_id,
        incident.semester_id,
        // incident.category_id,
        // 0, // Pass 0 since we're recalculating from all active incidents
      )
    }
    catch (scoreError) {
      console.error('Error updating conduct scores after incident deactivation:', scoreError)
      // Don't throw here - the incident was deactivated successfully
    }
  }
}

/**
 * Fetches conduct categories
 */
export async function fetchConductCategories(): Promise<Array<{
  id: string
  name: string
  description: string | null
  maxPoints: number
  color: string
  icon: string
  isActive: boolean
}>> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  await getUserSchoolId(supabase, userId) // Verify user has school access

  const { data: categoriesData, error } = await supabase
    .from('conduct_categories')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching conduct categories:', error)
    throw new Error('Erreur lors du chargement des catégories de conduite')
  }

  return (categoriesData || []).map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    maxPoints: category.max_points,
    color: category.color,
    icon: category.icon,
    isActive: category.is_active,
  }))
}

/**
 * Initializes conduct scores for students who don't have them yet
 * This should be run when setting up the conduct system for the first time
 */
export async function initializeConductScores(): Promise<{ initialized: number, errors: number }> {
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

  // Get all active students for the current school year
  const { data: activeStudents, error: studentsError } = await supabase
    .from('student_school_class')
    .select('student_id')
    .eq('school_id', schoolId)
    .eq('school_year_id', currentSchoolYear.id)
    .eq('is_active', true)
    .not('class_id', 'is', null)

  if (studentsError) {
    console.error('Error fetching active students:', studentsError)
    throw new Error('Erreur lors du chargement des étudiants actifs')
  }

  let initialized = 0
  let errors = 0

  // Initialize conduct scores for each student
  for (const student of activeStudents || []) {
    try {
      // Check if student already has a conduct score
      const { data: existingScore } = await supabase
        .from('conduct_scores')
        .select('id')
        .eq('student_id', student.student_id)
        .eq('school_year_id', currentSchoolYear.id)
        .eq('semester_id', currentSemester.id)
        .single()

      if (!existingScore) {
        // Calculate attendance score based on actual attendance data
        const attendanceResult = await calculateAttendanceScore(
          supabase,
          student.student_id,
          currentSchoolYear.id,
          currentSemester.id,
        )

        // Create initial conduct score with calculated attendance and default other scores
        await upsertConductScore(
          student.student_id,
          currentSchoolYear.id,
          currentSemester.id,
          {
            attendanceScore: attendanceResult.score,
            dresscodeScore: 3, // Default to maximum
            moralityScore: 4, // Default to maximum
            disciplineScore: 7, // Default to maximum
          },
        )

        initialized++
      }
    }
    catch (error) {
      console.error(`Error initializing conduct score for student ${student.student_id}:`, error)
      errors++
    }
  }

  return { initialized, errors }
}

export async function fetchClassesForFilter(): Promise<{ id: string, name: string }[]> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  const schoolId = await getUserSchoolId(supabase, userId)

  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, name')
    .eq('school_id', schoolId)
    .eq('is_active', true)
    .order('grade_id')
    .order('name')

  if (error) {
    console.error('Error fetching classes:', error)
    throw new Error('Erreur lors du chargement des classes')
  }

  return classes || []
}
