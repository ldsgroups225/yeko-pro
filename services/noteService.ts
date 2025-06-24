'use server'

import type { ReportCardData } from '@/app/report-card/types'
import type { NotesQueryParams } from '@/app/t/(schools)/(navigations)/notes/types'
import type { GradePoint } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/PerformanceTab/GradesTrend'
import type { PerformanceMetric } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/PerformanceTab/PerformanceOverview'
import type { SubjectPerformanceData } from '@/app/t/(schools)/(navigations)/students/[idNumber]/components/Tabs/PerformanceTab/SubjectPerformance'
import { NOTE_TYPE } from '@/constants'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatFullName } from '@/lib/utils'

export async function getStudentPerformanceMetrics(studentId: string): Promise<PerformanceMetric[]> {
  const supabase = await createClient()
  try {
    // Get current semester's average grade
    const averageDataQs = supabase
      .from('average_grades_view_with_rank')
      .select('average_grade, conduite, semester_id, school_year_id')
      .eq('student_id', studentId)
      .order('semester_id', { ascending: false })
      .limit(2)

    const semesterAverageDataQs = supabase
      .from('student_semester_average_view')
      .select('semester_average')
      .eq('student_id', studentId)
      .order('semester_id', { ascending: false })
      .single()

    // Get participation data
    const participationCountQs = supabase
      .from('note_details')
      .select('notes!inner(note_type)', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('notes.note_type', NOTE_TYPE.PARTICIPATION)
      // TODO: If you have a semesterId, you can add this filter:
      // .eq('notes.semester_id', semesterId)

    const [
      { data: averageData, error: averageError },
      { data: semesterAverageData, error: semesterAverageError },
      { count: participationCount, error: participationError },
    ] = await Promise.all([
      averageDataQs,
      semesterAverageDataQs,
      participationCountQs,
    ])

    if (averageError || semesterAverageError || participationError)
      throw averageError || semesterAverageError || participationError

    const currentAverage = averageData[0]?.average_grade || 0
    const previousAverage = averageData[1]?.average_grade || 0
    const currentBehavior = averageData[0]?.conduite || 0
    const previousBehavior = averageData[1]?.conduite || 0

    return [
      {
        id: 'average',
        name: 'Moyenne Générale',
        currentValue: semesterAverageData?.semester_average || 0,
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
        classes!inner(id, grade_id, series),
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

    let coefficientQs = supabase.from('coefficients').select('subject_id, coefficient')

    const classData = gradesData.length > 0 ? gradesData[0].classes : null
    classData?.grade_id !== -1 && (coefficientQs = coefficientQs.eq('grade_id', classData!.grade_id))
    classData?.series !== null && (coefficientQs = coefficientQs.eq('series', classData!.series))

    const { data: coefficients, error: coefficientsError } = await coefficientQs
    if (coefficientsError)
      throw coefficientsError

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
        coefficient: coefficients.find(c => c.subject_id === subjectId)?.coefficient || 0,
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
    .order('grade_id')

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
    .select('id, name:semester_name')
    .eq('is_current', true)
    .order('id')

  return semesters || []
}

export async function getCurrentSchoolYear() {
  const supabase = await createClient()

  const { data: schoolYear } = await supabase
    .from('school_years')
    .select('id, name:academic_year_name')
    .eq('is_current', true)
    .single()

  return schoolYear
}

export interface RawNoteData {
  noteId: string
  title: string | null
  weight: number | null
  noteType: NOTE_TYPE
  createdAt: string
  isGraded: boolean
  noteValue: number | null
  studentId: string
  firstName: string
  lastName: string
}

export async function getNotesForTableView(params: {
  classId: string
  subjectId: string
  semesterId: string
  teacherId?: string
}): Promise<RawNoteData[]> {
  const supabase = await createClient()

  const { data: notes, error } = await supabase
    .from('notes')
    .select(`
      id,
      title,
      weight,
      note_type,
      created_at,
      is_graded,
      note_details(
        note,
        student:students(
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq('class_id', params.classId)
    .eq('subject_id', params.subjectId)
    .eq('semester_id', Number(params.semesterId))
    .in('note_type', [
      NOTE_TYPE.PARTICIPATION,
      NOTE_TYPE.WRITING_QUESTION,
      NOTE_TYPE.CLASS_TEST,
      NOTE_TYPE.LEVEL_TEST,
      NOTE_TYPE.HOMEWORK,
    ])
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching notes for table view:', error)
    throw new Error('Failed to fetch notes data')
  }

  if (!notes)
    return []

  // Flatten the data structure to match RawNoteData
  const flattenedNotes: RawNoteData[] = notes.flatMap(note =>
    note.note_details.map(detail => ({
      noteId: note.id,
      title: note.title,
      weight: note.weight,
      noteType: note.note_type as NOTE_TYPE,
      createdAt: note.created_at,
      isGraded: note.is_graded,
      noteValue: detail.note,
      studentId: detail.student.id,
      firstName: detail.student.first_name,
      lastName: detail.student.last_name,
    })),
  )

  return flattenedNotes
}

function getDistinction(average: number | null): { label: string, available: { label: string, checked: boolean }[] } {
  const distinctions = [
    { label: 'TABLEAU D\'HONNEUR + FÉLICITATION', min: 16 },
    { label: 'TABLEAU D\'HONNEUR + ENCOURAGEMENT', min: 14 },
    { label: 'TABLEAU D\'HONNEUR', min: 12 },
    { label: 'TRAVAIL PASSABLE', min: 10 },
    { label: 'AVERTISSEMENT TRAVAIL', min: 0 },
  ]

  let finalLabel = 'AVERTISSEMENT TRAVAIL'
  if (average) {
    for (const dist of distinctions) {
      if (average >= dist.min) {
        finalLabel = dist.label
        break
      }
    }
  }

  return { label: finalLabel, available: [] }
}

export async function getReportCardDataForStudent(studentIdNumber: string, trimesterId?: string): Promise<ReportCardData> {
  const supabase = await createClient()

  const currentSemesterId = trimesterId ? Number(trimesterId) : null

  const semesterQs = supabase.from('semesters')
    .select('id, name:semester_name, is_current, school_year_id, start_date')

  if (currentSemesterId) {
    semesterQs.eq('id', currentSemesterId)
  }
  else {
    semesterQs.is('is_current', true)
  }

  const enrollmentQs = supabase.from('student_school_class')
    .select(`
      isRedoublement: is_redoublement,
      isAffected: is_government_affected,
      student: students!inner(*),
      classroom: classes!inner(id, name),
      grade: grades!inner(id, name),
      year: school_years!inner(id, academic_year_name),
      school: schools!inner(name, address, phone, code, status)
    `)
    .is('is_active', true)
    .eq('enrollment_status', 'accepted')
    .eq('student.id_number', studentIdNumber)
    .single()

  const [
    { data: enrollment, error: enrollmentError },
    { data: targetSemesters, error: semestersError },
  ] = await Promise.all([
    enrollmentQs,
    semesterQs,
  ])

  if (enrollmentError || !enrollment || semestersError || !targetSemesters?.length) {
    console.error('[E_STUDENT_SEMESTER_REPORT_CARD]:', enrollmentError || semestersError)
    throw new Error('Erreur lors de la récupération des données initiales du bulletin')
  }

  const { school, classroom, student, year, isAffected, isRedoublement } = enrollment
  const targetSemester = targetSemesters[0]
  const semesterName = targetSemester.name ?? 'N/A'

  // Fetch all semesters for the year to build the full report card
  const { data: allYearSemesters, error: allSemestersError } = await supabase
    .from('semesters')
    .select('id, name:semester_name')
    .eq('school_year_id', year.id)
    .order('start_date', { ascending: true })

  if (allSemestersError || !allYearSemesters)
    throw new Error('Erreur lors de la récupération des semestres de l\'année')

  const semesterIdMap = new Map(allYearSemesters.map((s, i) => [s.id, i + 1]))

  // All subsequent queries in parallel
  const classSizeQs = supabase
    .from('student_school_class')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', classroom.id)
    .eq('school_year_id', year.id)
    .eq('enrollment_status', 'accepted')

  const mainTeacherQs = supabase
    .from('teacher_class_assignments')
    .select('teacher:users(first_name, last_name, email)')
    .eq('class_id', classroom.id)
    .eq('is_main_teacher', true)
    .single()

  const subjectGradesQs = supabase
    .from('average_grades_view_with_rank')
    .select(`
        average_grade,
        rank,
        semester_id,
        subject:subjects!inner(id, name, short_name),
        coefficient:coefficients(coefficient)
    `)
    .eq('student_id', student.id)
    .eq('school_year_id', year.id)

  const teachersForClassQs = supabase
    .from('teacher_class_assignments')
    .select('subject_id, teacher:users(first_name, last_name, email)')
    .eq('class_id', classroom.id)

  const overallAveragesQs = supabase
    .from('student_semester_average_view')
    .select('semester_id, semester_average, rank_in_class')
    .eq('student_id', student.id)
    .eq('school_year_id', year.id)

  const classPerformanceQs = supabase
    .from('student_semester_average_view')
    .select('semester_average')
    .eq('class_id', classroom.id)
    .eq('school_year_id', year.id)
    .eq('semester_id', targetSemester.id)

  const attendanceQs = supabase.from('attendances')
    .select('status, is_excused, starts_at, ends_at')
    .eq('student_id', student.id)
    .eq('school_years_id', year.id)
    .eq('semesters_id', targetSemester.id)
    .eq('status', 'absent')

  const [
    { count: classSize, error: classSizeError },
    { data: mainTeacherData, error: mainTeacherError },
    { data: _subjectGrades, error: subjectGradesError }, // TODO: _subjectGrades to subjectGrades
    { data: _teachersForClass, error: teachersForClassError }, // TODO: _teachersForClass to teachersForClass
    { data: overallAverages, error: overallAveragesError },
    { data: classPerformance, error: classPerformanceError },
    { data: attendance, error: attendanceError },
  ] = await Promise.all([
    classSizeQs,
    mainTeacherQs,
    subjectGradesQs,
    teachersForClassQs,
    overallAveragesQs,
    classPerformanceQs,
    attendanceQs,
  ])

  if (classSizeError || mainTeacherError || subjectGradesError || teachersForClassError || overallAveragesError || classPerformanceError || attendanceError) {
    console.error('[E_STUDENT_SEMESTER_REPORT_CARD_DETAILS]:', { classSizeError, mainTeacherError, subjectGradesError, teachersForClassError, overallAveragesError, classPerformanceError, attendanceError })
    throw new Error('Erreur lors de la récupération des détails du bulletin')
  }

  // Utility to convert a time string ("HH:mm:ss") to milliseconds
  const timeStringToMs = (timeStr: string): number => {
    return new Date(`1970-01-01T${timeStr}`).getTime()
  }

  // Count valid unjustified absences (duration > 15 min and <= 50 min)
  let absences = 0
  let absencesJustified = 0

  attendance.forEach((a) => {
    const startMs = timeStringToMs(a.starts_at)
    const endMs = timeStringToMs(a.ends_at)
    const diffMinutes = (endMs - startMs) / (1000 * 60) // Convert to minutes

    if (diffMinutes > 15 && diffMinutes <= 50) {
      absences++

      if (a.is_excused) {
        absencesJustified++
      }
    }
    else if (diffMinutes > 50) {
      absences += 2

      if (a.is_excused) {
        absencesJustified += 2
      }
    }
  })

  // Main Teacher
  const principalTeacherName = mainTeacherData?.teacher
    ? formatFullName(mainTeacherData.teacher.first_name, mainTeacherData.teacher.last_name, mainTeacherData.teacher.email)
    : 'N/A'

  //   // Grades
  // const gradesBySubject = subjectGrades?.reduce((acc, grade) => {
  //   const subjectId = grade.subject.id
  //   if (!acc[subjectId]) {
  //     acc[subjectId] = {
  //       discipline: grade.subject.name,
  //       shortName: grade.subject.short_name,
  //       teacher: teachersForClass?.find(t => t.subject_id === subjectId)?.teacher ?? null,
  //       grades: [],
  //       coefficient: grade.coefficient[0]?.coefficient ?? 1,
  //     }
  //   }
  //   acc[subjectId].grades.push({
  //     semesterId: grade.semester_id,
  //     grade: grade.average_grade,
  //     rank: grade.rank,
  //   })
  //   return acc
  // }, {} as Record<string, any>)

  // const formattedGrades = Object.values(gradesBySubject ?? {}).map((sub: any) => {
  //   const gradeEntry: any = {
  //     discipline: sub.discipline,
  //     teacher: sub.teacher ? formatFullName(sub.teacher.first_name, sub.teacher.last_name) : 'N/A',
  //   }

  //   let totalWeightedGrade = 0
  //   let totalCoefficients = 0

  //   sub.grades.forEach((g: any) => {
  //     const trimIndex = semesterIdMap.get(g.semesterId)
  //     if (trimIndex) {
  //       gradeEntry[`trim${trimIndex}`] = g.grade?.toFixed(2) ?? 'N/A'
  //       gradeEntry[`rang${trimIndex}`] = g.rank?.split('/')[0] ?? 'N/A'
  //       if (g.grade !== null) {
  //         totalWeightedGrade += g.grade * sub.coefficient
  //         totalCoefficients += sub.coefficient
  //       }
  //     }
  //   })

  //   const annualMean = totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : null
  //   gradeEntry.mg = annualMean?.toFixed(2) ?? 'N/A'
  //   gradeEntry.evaluation = getEvaluation(annualMean)
  //   // Annual rank needs a separate calculation/view, setting to N/A for now
  //   gradeEntry.rang = 'N/A'

  //   return gradeEntry
  // })

  // Overall performance
  const currentOverall = overallAverages?.find(oa => oa.semester_id === targetSemester.id)
  const studentAverage = currentOverall?.semester_average ?? 0
  const studentRank = `${currentOverall?.rank_in_class ?? 'N/A'} / ${classSize ?? 'N/A'}`

  // Previous semester recall
  const currentTrimIndex = semesterIdMap.get(targetSemester.id) ?? 0
  let studentRecallTrim1 = 'N/A'
  if (currentTrimIndex > 1) {
    const prevSemester = allYearSemesters[currentTrimIndex - 2]
    const prevOverall = overallAverages?.find(oa => oa.semester_id === prevSemester.id)
    if (prevOverall)
      studentRecallTrim1 = `MOY = ${prevOverall.semester_average?.toFixed(2) ?? 'N/A'} Rang = ${prevOverall.rank_in_class ?? 'N/A'}e`
  }

  // Class performance
  const classAverages = classPerformance?.map(p => p.semester_average).filter((p): p is number => p !== null) ?? []
  const classMoyMaxi = classAverages.length ? Math.max(...classAverages).toFixed(2) : 'N/A'
  const classMoyMini = classAverages.length ? Math.min(...classAverages).toFixed(2) : 'N/A'
  const classMoyClasse = classAverages.length ? (classAverages.reduce((a, b) => a + b, 0) / classAverages.length).toFixed(2) : 'N/A'
  const classMoyGt10 = classAverages.length ? `${((classAverages.filter(a => a >= 10).length / classAverages.length) * 100).toFixed(2)}%` : 'N/A'

  // Distinction
  const distinction = getDistinction(studentAverage)

  // ==========================| TODO: NEXT |=============================
  // Create "subject short name" the loop inside compare with the subject
  // short name and add the grade to the subject to go to the report card
  // ====================================================================
  return {
    ministere: 'MINISTÈRE DE L\'EDUCATION NATIONALE ET DE L\'ALPHABÉTISATION',
    bulletinTitle: 'BULLETIN TRIMESTRIEL',
    term: semesterName,
    schoolYear: year.academic_year_name ?? 'N/A',
    schoolName: school.name,
    schoolAddress: school.address ?? 'N/A',
    schoolPhone: school.phone ?? 'N/A',
    schoolCode: school.code ?? 'N/A',
    schoolStatus: school.status,
    studentFullName: `${student.first_name} ${student.last_name}`,
    studentMatricule: studentIdNumber,
    studentClass: classroom.name,
    studentEffectif: classSize?.toString() ?? 'N/A',
    studentSex: student.gender ?? 'N/A',
    studentBirthDate: student.date_of_birth ? formatDate(student.date_of_birth) : 'N/A',
    studentBirthplace: student.birth_place ?? 'N/A',
    studentNationality: student.nationality,
    studentRedoublement: isRedoublement ? 'OUI' : 'NON',
    studentRegime: isAffected ? 'AFF' : 'NAFF',
    studentStatut: '',
    studentIntern: '',
    // ! Keep hard coded grades for now
    grades: [
      { discipline: 'PHILOSOPHIE', trim1: '11.66', rang1: '8e', trim2: '08.75', rang2: '15e', mg: '09.72', rang: '14e', teacher: 'BA LOU', evaluation: 'Travail Insuffisant' },
      { discipline: 'FRANÇAIS', trim1: '10.00', rang1: '13e', trim2: '10.75', rang2: '12e', mg: '10.50', rang: '15e', teacher: 'ABOU MEGNAN', evaluation: 'Travail Passable' },
      { discipline: 'ANGLAIS', trim1: '08.33', rang1: '16e', trim2: '09.25', rang2: '13e', mg: '08.94', rang: '16e', teacher: 'DOUTE BAHO ANDERSON', evaluation: 'Travail Insuffisant' },
      { discipline: 'ESPAGNOL (L.V2)', trim1: '11.66', rang1: '8e', trim2: '10.00', rang2: '13e', mg: '10.45', rang: '11e', teacher: 'LEGNON BLE DESIRE', evaluation: 'Travail Passable' },
      { discipline: 'HIST-GEO', trim1: '12.00', rang1: '5e', trim2: '11.00', rang2: '11e', mg: '11.35', rang: '10e', teacher: 'ASSOUMAN BAH', evaluation: 'Travail Passable' },
      { discipline: 'BILAN LITTERAIRES', trim1: '10.68', trim2: '10', mg: '10.22' },
      { discipline: 'MATHÉMATIQUES', trim1: '05.00', rang1: '17e', trim2: '12.25', rang2: '6e', mg: '09.83', rang: '11e', teacher: 'SAVI DEGBEY PAULIN', evaluation: 'Assez Bien' },
      { discipline: 'PHYSIQUE-CHIMIE', mg: '' },
      { discipline: 'SCIENCE DE LA VIE ET DE LA TERRE', mg: '' },
      { discipline: 'BILAN SCIENCES', trim1: '05.00', trim2: '12.25', mg: '09.83' },
      { discipline: 'EPS', trim1: '14.00', rang1: '3e', trim2: '12.37', rang2: '3e', mg: '12.91', rang: '3e', teacher: 'DOUBA TIEBI TRA', evaluation: 'Assez Bien' },
      { discipline: 'CONDUITE', trim1: '11.00', rang1: '17e', trim2: '13.50', rang2: '17e', mg: '12.25', rang: '17e', teacher: 'BROU DIAMA', evaluation: 'Assez Bien' },
      { discipline: 'BILAN AUTRES', trim1: '12.50', trim2: '12.93', mg: '12.78' },
    ],
    totalPoints: '210.57', // TODO: From the reduce of the average of student_semester_average_view * coefficient per subject per series if applicable
    absencesTotal: absences.toString(),
    absencesJustified: absencesJustified.toString(),
    absencesUnjustified: (absences - absencesJustified).toString(),
    studentAverage: studentAverage.toFixed(2),
    studentRank,
    studentRecallTrim1,
    classMoyMaxi,
    classMoyMini,
    classMoyClasse,
    classMoyLt85: 'N/A', // Logic for these specific brackets needs clarification
    classMoy85To10: 'N/A',
    classMoyGt10,
    distinction: distinction.label,
    distinctionsAvailable: [ // This should be driven by the distinction logic
      { label: 'TABLEAU D\'HONNEUR + FÉLICITATION', checked: distinction.label === 'TABLEAU D\'HONNEUR + FÉLICITATION' },
      { label: 'TABLEAU D\'HONNEUR + ENCOURAGEMENT', checked: distinction.label === 'TABLEAU D\'HONNEUR + ENCOURAGEMENT' },
      { label: 'TABLEAU D\'HONNEUR', checked: distinction.label === 'TABLEAU D\'HONNEUR' },
      { label: 'TRAVAIL PASSABLE', checked: distinction.label === 'TRAVAIL PASSABLE' },
    ],
    sanctionsAvailable: [
      { label: 'AVERTISSEMENT TRAVAIL', checked: distinction.label === 'AVERTISSEMENT TRAVAIL' },
      { label: 'BLÂME TRAVAIL', checked: false }, // Needs specific logic
    ],
    appreciationText: distinction.label,
    headTeacherSignatureLabel: 'Nom, Signature et Cachet du Chef d\'Établissement',
    principalTeacherLabel: 'Nom, Signature du Professeur Principal',
    principalTeacherName,
    reportDateLabel: 'Fait le',
    reportDate: new Date().toLocaleDateString('fr-FR'),
    footerSchoolName: school.name,
    footerYekoVersion: 'YEKO / Version: 1.0.0',
    footerDisclaimer: 'Ceci est un document original, aucun duplicata ne sera délivré.',
  }
}
