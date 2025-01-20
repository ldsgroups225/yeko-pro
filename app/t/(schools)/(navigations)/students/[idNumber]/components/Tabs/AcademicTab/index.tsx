'use client'

import type { Student } from '../../../types'
import type { Subject } from './MainSubjects'
import type { Observation } from './TeacherObservations'
import type { Term } from './TermProgress'
import { Card } from '@/components/ui/card'
import { MainSubjects } from './MainSubjects'
import { TeacherObservations } from './TeacherObservations'
import { TermProgress } from './TermProgress'

interface AcademicTabProps {
  student: Student // Will be used for API calls and data fetching
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockTerms: Term[] = [
  {
    id: 't1',
    name: 'Trimestre 1',
    average: 16.5,
    maxScore: 20,
    progress: 100,
    rank: {
      position: 3,
      total: 42,
    },
  },
  {
    id: 't2',
    name: 'Trimestre 2',
    average: 15.8,
    maxScore: 20,
    progress: 100,
    rank: {
      position: 5,
      total: 42,
    },
  },
  {
    id: 't3',
    name: 'Trimestre 3',
    average: 0,
    maxScore: 20,
    progress: 0,
  },
]

const mockSubjects: Subject[] = [
  {
    id: 'math',
    name: 'Mathématiques',
    grade: 17,
    maxGrade: 20,
    coefficient: 3,
  },
  {
    id: 'french',
    name: 'Français',
    grade: 15,
    maxGrade: 20,
    coefficient: 2,
  },
  {
    id: 'science',
    name: 'Sciences',
    grade: 16,
    maxGrade: 20,
    coefficient: 2,
  },
]

const mockObservations: Observation[] = [
  {
    id: 'obs1',
    content: 'Élève sérieux et appliqué. Participe activement en classe et montre un réel intérêt pour les mathématiques.',
    teacher: {
      name: 'M. Konan',
      role: 'Professeur Principal',
    },
    date: '15 janvier 2025',
  },
]

export function AcademicTab({ student: _student, isLoading }: AcademicTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchTerms(student.id) }, [student.id])

  return (
    <Card>
      <div className="space-y-6">
        <TermProgress
          terms={mockTerms}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MainSubjects
            subjects={mockSubjects}
            isLoading={isLoading}
          />
          <TeacherObservations
            observations={mockObservations}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Card>
  )
}

export { MainSubjects } from './MainSubjects'
export type { Subject } from './MainSubjects'
export { TeacherObservations } from './TeacherObservations'
export type { Observation } from './TeacherObservations'
// Re-export sub-components and types for direct access
export { TermProgress } from './TermProgress'
export type { Term } from './TermProgress'
