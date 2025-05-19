'use client'

import type { Student } from '../../../types'
import type { Absence } from './AbsenceHistory'
import type { AttendanceStats } from './AttendanceSummary'

import { Card } from '@/components/ui/card'
import {
  getStudentAbsenceHistory,
  getStudentAttendanceStats,
} from '@/services/attendanceService'
import { useEffect, useState } from 'react'

import { AbsenceHistory } from './AbsenceHistory'
import { AttendanceSummary } from './AttendanceSummary'

interface AttendanceTabProps {
  student: Student
  isLoading?: boolean
}

export function AttendanceTab({ student, isLoading: initialLoading }: AttendanceTabProps) {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [absences, setAbsences] = useState<Absence[]>([])
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchAttendanceData() {
      if (!student?.id)
        return

      try {
        setIsLoading(true)
        const [attendanceStats, absenceHistory] = await Promise.all([
          getStudentAttendanceStats(student.id),
          getStudentAbsenceHistory(student.id),
        ])

        if (mounted) {
          setStats(attendanceStats)
          setAbsences(absenceHistory)
          setError(null)
        }
      }
      catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch attendance data')
          console.error('Error fetching attendance data:', err)
        }
      }
      finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchAttendanceData()

    return () => {
      mounted = false
    }
  }, [student?.id])

  if (error) {
    return (
      <Card>
        <div className="p-4 text-red-500">
          Error loading attendance data:
          {' '}
          {error}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        <AttendanceSummary
          stats={stats || {
            totalDaysAbsent: 0,
            totalLateArrivals: 0,
            justifiedAbsences: 0,
            unjustifiedAbsences: 0,
          }}
          isLoading={isLoading}
        />

        <AbsenceHistory
          absences={absences}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}

export { AbsenceHistory } from './AbsenceHistory'
export type { Absence } from './AbsenceHistory'
export { AttendanceSummary } from './AttendanceSummary'
export type { AttendanceStats } from './AttendanceSummary'
