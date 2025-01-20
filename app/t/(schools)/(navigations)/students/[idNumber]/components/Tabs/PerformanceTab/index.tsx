'use client'

import type { Student } from '../../../types'
import type { GradePoint } from './GradesTrend'
import type { PerformanceMetric } from './PerformanceOverview'
import type { SubjectPerformanceData } from './SubjectPerformance'
import { Card } from '@/components/ui/card'

import { GradesTrend } from './GradesTrend'
import { PerformanceOverview } from './PerformanceOverview'
import { SubjectPerformance } from './SubjectPerformance'

interface PerformanceTabProps {
  student: Student
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockMetrics: PerformanceMetric[] = [
  {
    id: 'average',
    name: 'Moyenne Générale',
    currentValue: 15.5,
    previousValue: 14.8,
    maxValue: 20,
    trend: 'up',
    category: 'academic',
  },
  {
    id: 'participation',
    name: 'Participation',
    currentValue: 16,
    previousValue: 16,
    maxValue: 20,
    trend: 'stable',
    category: 'participation',
  },
  {
    id: 'behavior',
    name: 'Comportement',
    currentValue: 18,
    previousValue: 17,
    maxValue: 20,
    trend: 'up',
    category: 'behavior',
  },
]

const mockGradePoints: GradePoint[] = [
  { period: 'Sept', average: 14.5, classAverage: 13.8 },
  { period: 'Oct', average: 15.2, classAverage: 14.0 },
  { period: 'Nov', average: 14.8, classAverage: 13.9 },
  { period: 'Dec', average: 15.5, classAverage: 14.2 },
  { period: 'Jan', average: 15.8, classAverage: 14.1 },
]

const mockSubjects: SubjectPerformanceData[] = [
  {
    id: 'math',
    name: 'Mathématiques',
    currentGrade: 17.5,
    previousGrade: 16.0,
    maxGrade: 20,
    trend: 'up',
    classAverage: 14.5,
    coefficient: 3,
    isStrength: true,
    needsImprovement: false,
    teacherComment: 'Excellent niveau, participe activement en classe.',
  },
  {
    id: 'french',
    name: 'Français',
    currentGrade: 13.5,
    previousGrade: 14.0,
    maxGrade: 20,
    trend: 'down',
    classAverage: 13.8,
    coefficient: 3,
    isStrength: false,
    needsImprovement: true,
    teacherComment: 'Des difficultés en expression écrite. Un soutien serait bénéfique.',
  },
  {
    id: 'physics',
    name: 'Physique-Chimie',
    currentGrade: 15.5,
    previousGrade: 15.5,
    maxGrade: 20,
    trend: 'stable',
    classAverage: 14.2,
    coefficient: 2,
    isStrength: false,
    needsImprovement: false,
  },
]

export function PerformanceTab({ student: _student, isLoading }: PerformanceTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchPerformanceData(student.id) }, [student.id])

  return (
    <Card>
      <div className="space-y-6">
        <PerformanceOverview
          metrics={mockMetrics}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6">
          <GradesTrend
            data={mockGradePoints}
            isLoading={isLoading}
          />

          <SubjectPerformance
            subjects={mockSubjects}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Card>
  )
}

// Re-export sub-components
export { GradesTrend } from './GradesTrend'
// Re-export types
export type { GradePoint } from './GradesTrend'
export { PerformanceOverview } from './PerformanceOverview'

export type { PerformanceMetric } from './PerformanceOverview'
export { SubjectPerformance } from './SubjectPerformance'
export type { SubjectPerformanceData } from './SubjectPerformance'
