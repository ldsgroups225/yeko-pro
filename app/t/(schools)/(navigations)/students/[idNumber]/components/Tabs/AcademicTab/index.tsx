'use client'

// Types
import type { Student } from '../../../types'
import type { Observation, Subject, Term } from './types'
import { Card } from '@/components/ui/card'

import { getStudentAcademicData } from '@/services/studentService'
// External imports
import { useEffect, useState } from 'react'

// Components
import { MainSubjects } from './MainSubjects'
import { TeacherObservations } from './TeacherObservations'
import { TermProgress } from './TermProgress'

interface AcademicTabProps {
  student: Student
  isLoading?: boolean
}

export function AcademicTab({ student, isLoading: initialLoading }: AcademicTabProps) {
  const [terms, setTerms] = useState<Term[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState<boolean>(initialLoading || true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAcademicData() {
      if (!student?.id)
        return

      try {
        setLoading(true)
        const academicData = await getStudentAcademicData(student.id)

        // Transform semester data to terms format
        const fetchedTerms = academicData.semesters.map(semester => ({
          id: `s${semester.id}`,
          name: semester.name,
          average: semester.average || 0,
          maxScore: 20,
          progress: semester.isComplete
            ? 100
            : (new Date() >= new Date(semester.startDate)
              && new Date() <= new Date(semester.endDate))
                ? 50
                : 0,
          rank: semester.rank,
        }))

        // Transform subjects data
        const fetchedSubjects = academicData.subjects.map(subject => ({
          id: subject.id,
          name: subject.name,
          grade: subject.grade || 0,
          maxGrade: 20,
          coefficient: subject.coefficient,
        }))

        // Transform teacher observations
        const fetchedObservations = academicData.observations.map(obs => ({
          id: obs.id,
          content: obs.content,
          teacher: {
            name: obs.teacher.name,
            role: obs.teacher.isMainTeacher ? 'Professeur Principal' : 'Professeur',
          },
          date: new Date(obs.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        }))

        setTerms(fetchedTerms)
        setSubjects(fetchedSubjects)
        setObservations(fetchedObservations)
      }
      catch (err) {
        console.error('Error fetching academic data:', err)
        setError('Unable to load academic data')
      }
      finally {
        setLoading(false)
      }
    }

    fetchAcademicData()
  }, [student?.id])

  if (error) {
    return <Card><div className="p-4 text-red-500">{error}</div></Card>
  }

  return (
    <Card>
      <div className="space-y-6">
        <TermProgress
          terms={terms}
          isLoading={loading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MainSubjects
            subjects={subjects}
            isLoading={loading}
          />
          <TeacherObservations
            observations={observations}
            isLoading={loading}
          />
        </div>
      </div>
    </Card>
  )
}

// Re-export sub-components and types
export { MainSubjects } from './MainSubjects'
export { TeacherObservations } from './TeacherObservations'
export { TermProgress } from './TermProgress'
export type { Observation, Subject, Term } from './types'
