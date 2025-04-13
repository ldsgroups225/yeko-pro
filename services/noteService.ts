'use server'

import type { NotesQueryParams } from '@/app/t/(schools)/(navigations)/notes/types'
import type { GradePoint } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/PerformanceTab/GradesTrend'
import type { PerformanceMetric } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/PerformanceTab/PerformanceOverview'
import type { SubjectPerformanceData } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/PerformanceTab/SubjectPerformance'
import { NOTE_TYPE } from '@/constants'
import { createClient } from '@/lib/supabase/server'

export async function getStudentPerformanceMetrics(studentId: string): Promise<PerformanceMetric[]> {
  const supabase = await createClient()
  try {
    // Get current semester's average grade
    const { data: averageData, error: averageError } = await supabase
      .from('average_grades_view_with_rank')
      .select('average_grade, conduite')
      .eq('student_id', studentId)
      .order('semester_id', { ascending: false })
      .limit(2)

    if (averageError)
      throw averageError

    // Get participation data
    const { count: participationCount, error: participationError } = await supabase
      .from('participations')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)

    if (participationError)
      throw participationError

    const currentAverage = averageData[0]?.average_grade || 0
    const previousAverage = averageData[1]?.average_grade || 0
    const currentBehavior = averageData[0]?.conduite || 0
    const previousBehavior = averageData[1]?.conduite || 0

    return [
      {
        id: 'average',
        name: 'Moyenne Générale',
        currentValue: currentAverage,
        previousValue: previousAverage,
        maxValue: 20,
        trend: currentAverage > previousAverage ? 'up' : currentAverage < previousAverage ? 'down' : 'stable',
        category: 'academic',
      },
      {
        id: 'participation',
        name: 'Participation',
        currentValue: participationCount || 0,
        previousValue: participationCount || 0, // We don't have historical participation data yet
        maxValue: 20,
        trend: 'stable',
        category: 'participation',
      },
      {
        id: 'behavior',
        name: 'Comportement',
        currentValue: currentBehavior,
        previousValue: previousBehavior,
        maxValue: 20,
        trend: currentBehavior > previousBehavior ? 'up' : currentBehavior < previousBehavior ? 'down' : 'stable',
        category: 'behavior',
      },
    ]
  }
  catch (error) {
    console.error('Error fetching performance metrics:', error)
    throw error
  }
}

export async function getStudentGradePoints(studentId: string): Promise<GradePoint[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('average_grades_view_with_rank')
      .select(`
        average_grade,
        class_id,
        semester_id
      `)
      .eq('student_id', studentId)
      .order('semester_id', { ascending: true })

    if (error)
      throw error

    // Filter out entries with null class_id or semester_id
    const validData = data.filter(
      (grade): grade is typeof grade & { class_id: string, semester_id: number } => (
        grade.class_id !== null && grade.semester_id !== null
      ),
    )

    // Get class averages for comparison
    const classAverages = await Promise.all(
      validData.map(async (grade) => {
        const { data: classData, error: classError } = await supabase
          .from('average_grades_view_with_rank')
          .select('average_grade')
          .eq('class_id', grade.class_id)
          .eq('semester_id', grade.semester_id)

        if (classError)
          throw classError

        const sum = classData.reduce((acc, curr) => acc + (curr.average_grade || 0), 0)
        return classData.length ? sum / classData.length : 0
      }),
    )

    // Convert to GradePoint format
    return validData.map((grade, index) => ({
      period: `Sem ${grade.semester_id}`,
      average: grade.average_grade || 0,
      classAverage: classAverages[index],
    }))
  }
  catch (error) {
    console.error('Error fetching grade points:', error)
    throw error
  }
}

export async function getStudentSubjectPerformance(studentId: string): Promise<SubjectPerformanceData[]> {
  const supabase = await createClient()

  try {
    // Get current and previous semester grades by subject
    const { data: gradesData, error: gradesError } = await supabase
      .from('average_grades_view_with_rank')
      .select(`
        average_grade,
        subject_id,
        rank,
        semester_id,
        subjects (
          name
        )
      `)
      .eq('student_id', studentId)
      .order('semester_id', { ascending: false })
      .limit(20) // Get enough data for current and previous semester

    if (gradesError)
      throw gradesError

    // Filter out entries with null subject_id
    const validGradesData = gradesData.filter(
      (grade): grade is typeof grade & { subject_id: string } => grade.subject_id !== null,
    )

    // Group by subject
    const subjectGrades = validGradesData.reduce((acc, grade) => {
      if (!acc[grade.subject_id]) {
        acc[grade.subject_id] = []
      }
      acc[grade.subject_id].push({
        grade: grade.average_grade,
        semester: grade.semester_id,
        subjectName: grade.subjects?.name ?? null,
        rank: grade.rank,
      })
      return acc
    }, {} as Record<string, Array<{ grade: number | null, semester: number | null, subjectName: string | null, rank: string | null }>>)

    // Convert to SubjectPerformanceData format
    return Object.entries(subjectGrades).map(([subjectId, grades]) => {
      const currentGrade = grades[0]?.grade || 0
      const previousGrade = grades[1]?.grade || 0

      return {
        id: subjectId,
        name: grades[0]?.subjectName || 'Unknown Subject',
        currentGrade,
        previousGrade,
        maxGrade: 20,
        trend: currentGrade > previousGrade ? 'up' : currentGrade < previousGrade ? 'down' : 'stable',
        classAverage: 0, // We'll need to calculate this separately
        coefficient: 1, // This should come from coefficients table
        isStrength: currentGrade >= 14,
        needsImprovement: currentGrade < 10,
        teacherComment: grades[0]?.rank ? `Rang: ${grades[0].rank}` : undefined,
      }
    })
  }
  catch (error) {
    console.error('Error fetching subject performance:', error)
    throw error
  }
}

export async function getNotes(params?: NotesQueryParams) {
  const supabase = await createClient()

  let query = supabase
    .from('notes')
    .select('*, subject:subjects(name)')
    .order('created_at', { ascending: false })

  if (params?.classId) {
    query = query.eq('class_id', params.classId)
  }

  if (params?.subjectId) {
    query = query.eq('subject_id', params.subjectId)
  }

  if (params?.semesterId) {
    query = query.eq('semester_id', Number(params.semesterId))
  }

  if (params?.schoolYearId) {
    query = query.eq('school_year_id', Number(params.schoolYearId))
  }

  if (params?.searchTerm) {
    query = query.ilike('title', `%${params.searchTerm}%`)
  }

  if (params?.noteType) {
    query = query.eq('note_type', params.noteType)
  }
  else {
    query = query.in('note_type', [
      NOTE_TYPE.WRITING_QUESTION,
      NOTE_TYPE.CLASS_TEST,
      NOTE_TYPE.LEVEL_TEST,
    ])
  }

  const { data: notes, error } = await query

  if (error) {
    console.error('Error fetching notes:', error)
    return []
  }

  return notes
}

export async function getClasses() {
  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('classes')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return classes || []
}

export async function getSubjects() {
  const supabase = await createClient()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name')

  return subjects || []
}

export async function getSemesters() {
  const supabase = await createClient()

  const { data: semesters } = await supabase
    .from('semesters')
    .select('id, semester_name')
    .eq('is_current', true)
    .order('id')

  return semesters || []
}

export async function getCurrentSchoolYear() {
  const supabase = await createClient()

  const { data: schoolYear } = await supabase
    .from('school_years')
    .select('id, academic_year_name')
    .eq('is_current', true)
    .single()

  return schoolYear
}
