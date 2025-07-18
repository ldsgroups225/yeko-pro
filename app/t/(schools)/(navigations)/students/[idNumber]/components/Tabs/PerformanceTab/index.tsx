'use client'

import type { Student } from '../../../types'
import type { GradePoint } from './GradesTrend'
import type { PerformanceMetric } from './PerformanceOverview'
import type { SubjectPerformanceData } from './SubjectPerformance'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  getStudentGradePoints,
  getStudentPerformanceMetrics,
  getStudentSubjectPerformance,
} from '@/services/noteService'

import { GradesTrend } from './GradesTrend'
import { PerformanceOverview } from './PerformanceOverview'
import { SubjectPerformance } from './SubjectPerformance'

interface PerformanceTabProps {
  student: Student
  isLoading?: boolean
}

export function PerformanceTab({ student, isLoading: initialLoading = false }: PerformanceTabProps) {
  const [state, setState] = useState<{
    metrics: PerformanceMetric[]
    gradePoints: GradePoint[]
    subjects: SubjectPerformanceData[]
    isLoading: boolean
    error: string | null
  }>({
    metrics: [],
    gradePoints: [],
    subjects: [],
    isLoading: initialLoading,
    error: null,
  })

  useEffect(() => {
    let mounted = true

    async function fetchPerformanceData() {
      if (!student?.id)
        return

      try {
        setState(prev => ({ ...prev, isLoading: true }))
        const [performanceMetrics, gradeHistory, subjectPerformance] = await Promise.all([
          getStudentPerformanceMetrics(student.id),
          getStudentGradePoints(student.id),
          getStudentSubjectPerformance(student.id),
        ])

        if (mounted) {
          setState({
            metrics: performanceMetrics,
            gradePoints: gradeHistory,
            subjects: subjectPerformance,
            isLoading: false,
            error: null,
          })
        }
      }
      catch (err) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Failed to fetch performance data',
            isLoading: false,
          }))
          console.error('Error fetching performance data:', err)
        }
      }
    }

    fetchPerformanceData()
    return () => {
      mounted = false
    }
  }, [student?.id])

  if (state.error) {
    return (
      <Card>
        <div className="p-4 text-red-500">
          Error loading performance data:
          {' '}
          {state.error}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        <PerformanceOverview
          metrics={state.metrics}
          isLoading={state.isLoading}
        />

        <div className="grid grid-cols-1 gap-6">
          <GradesTrend
            data={state.gradePoints}
            isLoading={state.isLoading}
          />

          <SubjectPerformance
            subjects={state.subjects}
            isLoading={state.isLoading}
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
