'use client'

import type { Student } from '../../../types'
import type { GradePoint } from './GradesTrend'
import type { PerformanceMetric } from './PerformanceOverview'
import type { SubjectPerformanceData } from './SubjectPerformance'

import { Card } from '@/components/ui/card'
import {
  getStudentGradePoints,
  getStudentPerformanceMetrics,
  getStudentSubjectPerformance,
} from '@/services/noteService'
import { useEffect, useState } from 'react'

import { GradesTrend } from './GradesTrend'
import { PerformanceOverview } from './PerformanceOverview'
import { SubjectPerformance } from './SubjectPerformance'

interface PerformanceTabProps {
  student: Student
  isLoading?: boolean
}

export function PerformanceTab({ student, isLoading: initialLoading }: PerformanceTabProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [gradePoints, setGradePoints] = useState<GradePoint[]>([])
  const [subjects, setSubjects] = useState<SubjectPerformanceData[]>([])
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchPerformanceData() {
      if (!student?.id)
        return

      try {
        setIsLoading(true)
        const [performanceMetrics, gradeHistory, subjectPerformance] = await Promise.all([
          getStudentPerformanceMetrics(student.id),
          getStudentGradePoints(student.id),
          getStudentSubjectPerformance(student.id),
        ])

        if (mounted) {
          setMetrics(performanceMetrics)
          setGradePoints(gradeHistory)
          setSubjects(subjectPerformance)
          setError(null)
        }
      }
      catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch performance data')
          console.error('Error fetching performance data:', err)
        }
      }
      finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPerformanceData()

    return () => {
      mounted = false
    }
  }, [student?.id])

  if (error) {
    return (
      <Card>
        <div className="p-4 text-red-500">
          Error loading performance data:
          {' '}
          {error}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        <PerformanceOverview
          metrics={metrics}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6">
          <GradesTrend
            data={gradePoints}
            isLoading={isLoading}
          />

          <SubjectPerformance
            subjects={subjects}
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
