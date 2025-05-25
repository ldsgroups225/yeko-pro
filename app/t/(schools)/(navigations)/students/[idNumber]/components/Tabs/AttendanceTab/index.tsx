'use client'

import type { Student } from '../../../types'
import type { Attendance } from './AttendanceHistory'
import type { AttendanceStats } from './AttendanceSummary'

import { Card } from '@/components/ui/card'
import {
  getStudentAttendanceHistory,
  getStudentAttendanceStats,
} from '@/services/attendanceService'
import { useEffect, useState } from 'react'

import { AttendanceHistory } from './AttendanceHistory'
import { AttendanceSummary } from './AttendanceSummary'

interface AttendanceTabProps {
  student: Student
  isLoading?: boolean
}

export function AttendanceTab({ student, isLoading: initialLoading }: AttendanceTabProps) {
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchAttendanceData() {
      if (!student?.id)
        return

      try {
        setIsLoading(true)
        const [attendanceStats, attendanceHistory] = await Promise.all([
          getStudentAttendanceStats(student.id),
          getStudentAttendanceHistory(student.id),
        ])

        if (mounted) {
          setStats(attendanceStats)
          setAttendances(attendanceHistory)
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

        <AttendanceHistory
          attendances={attendances}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}

export { AttendanceHistory as AbsenceHistory } from './AttendanceHistory'
export type { Attendance as Absence } from './AttendanceHistory'
export { AttendanceSummary } from './AttendanceSummary'
export type { AttendanceStats } from './AttendanceSummary'
