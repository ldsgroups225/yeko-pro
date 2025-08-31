'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

export interface EducatorStats {
  totalStudents: number
  presentToday: number
  absentToday: number
  conductIssues: number
}

// Helper functions for authentication
async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error: userError } = await client.auth.getUser()
  if (userError) {
    console.error('Error fetching user:', userError)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

async function getUserSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error: userSchoolError } = await client
    .from('user_roles')
    .select('school_id')
    .eq('user_id', userId)
    .eq('role_id', ERole.EDUCATOR)
    .single()

  if (userSchoolError) {
    console.error('Error fetching user school:', userSchoolError)
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }

  if (!userSchool?.school_id) {
    throw new Error('Utilisateur non associé à un établissement scolaire')
  }

  return userSchool.school_id
}

async function getCurrentSchoolYear(client: SupabaseClient): Promise<number> {
  const { data: currentSchoolYear, error } = await client
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (error || !currentSchoolYear) {
    console.error('Error fetching current school year:', error)
    throw new Error('Aucune année scolaire en cours trouvée')
  }

  return currentSchoolYear.id
}

async function getCurrentSemester(client: SupabaseClient): Promise<number> {
  const { data: currentSemester, error } = await client
    .from('semesters')
    .select('id')
    .eq('is_current', true)
    .single()

  if (error || !currentSemester) {
    console.error('Error fetching current semester:', error)
    throw new Error('Aucun semestre en cours trouvé')
  }

  return currentSemester.id
}

// Database function to get educator stats
async function getEducatorStatsFromDatabase(): Promise<EducatorStats> {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)

  const [schoolId, schoolYearId, semesterId] = await Promise.all([
    getUserSchoolId(supabase, userId),
    getCurrentSchoolYear(supabase),
    getCurrentSemester(supabase),
  ])

  // Get today's date in ISO format (start and end of day)
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).toISOString()

  // Get recent conduct issues (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalStudents },
    { data: todayAttendance },
    { count: conductIssues },
  ] = await Promise.all([
    supabase
      .from('student_school_class')
      .select('student_id', { count: 'exact' })
      .eq('school_id', schoolId)
      .eq('school_year_id', schoolYearId)
      .eq('is_active', true)
      .not('class_id', 'is', null),
    supabase
      .from('attendances')
      .select('status')
      .eq('school_years_id', schoolYearId)
      .eq('semesters_id', semesterId)
      .gte('starts_at', startOfDay)
      .lte('starts_at', endOfDay)
      .in('class_id', (await supabase
        .from('classes')
        .select('id')
        .eq('school_id', schoolId)
        .eq('is_active', true)).data?.map(c => c.id) || []),
    supabase
      .from('conduct_incidents')
      .select('id', { count: 'exact' })
      .eq('school_year_id', schoolYearId)
      .eq('semester_id', semesterId)
      .eq('is_active', true)
      .gte('reported_at', sevenDaysAgo)
      .in('student_id', (await supabase
        .from('student_school_class')
        .select('student_id')
        .eq('school_id', schoolId)
        .eq('school_year_id', schoolYearId)
        .eq('is_active', true)).data?.map(s => s.student_id) || []),
  ])

  // Count present and absent students
  let presentToday = 0
  let absentToday = 0

  if (todayAttendance) {
    presentToday = todayAttendance.filter(att => att.status === 'present').length
    absentToday = todayAttendance.filter(att => att.status === 'absent').length
  }

  return {
    totalStudents: totalStudents || 0,
    presentToday,
    absentToday,
    conductIssues: conductIssues || 0,
  }
}

// Cached function for educator stats
export const getEducatorStats = cache(async (): Promise<EducatorStats> => {
  try {
    const stats = await getEducatorStatsFromDatabase()
    return stats
  }
  catch (error) {
    console.error('Error fetching educator stats:', error)
    // Return default stats on error
    return {
      totalStudents: 0,
      presentToday: 0,
      absentToday: 0,
      conductIssues: 0,
    }
  }
})

// Additional helper function to get educator's classes
export const getEducatorClassesForStats = cache(async (): Promise<{ id: string, name: string }[]> => {
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

// Helper function to get educator's students count by class
export const getEducatorStudentsByClass = cache(async (): Promise<{ classId: string, className: string, studentCount: number }[]> => {
  const supabase = await createClient()
  const userId = await checkAuthUserId(supabase)
  const schoolId = await getUserSchoolId(supabase, userId)
  const schoolYearId = await getCurrentSchoolYear(supabase)

  const { data: studentsByClass, error } = await supabase
    .from('student_school_class')
    .select(`
      class_id,
      classes!inner(name)
    `)
    .eq('school_id', schoolId)
    .eq('school_year_id', schoolYearId)
    .eq('is_active', true)
    .not('class_id', 'is', null)

  if (error) {
    console.error('Error fetching students by class:', error)
    throw new Error('Erreur lors du chargement des étudiants par classe')
  }

  // Group by class and count students
  const classCounts = (studentsByClass || []).reduce((acc, student) => {
    const classId = student.class_id
    const className = student.classes?.name || 'Classe inconnue'

    if (classId && !acc[classId]) {
      acc[classId] = { classId, className, studentCount: 0 }
    }
    if (classId) {
      acc[classId].studentCount++
    }
    return acc
  }, {} as Record<string, { classId: string, className: string, studentCount: number }>)

  return Object.values(classCounts)
})
