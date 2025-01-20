'use client'

import type { Student } from '../../../types'
import type { Absence } from './AbsenceHistory'
import type { AttendanceStats } from './AttendanceSummary'
import { Card } from '@/components/ui/card'
import { AbsenceHistory } from './AbsenceHistory'
import { AttendanceSummary } from './AttendanceSummary'

interface AttendanceTabProps {
  student: Student
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockStats: AttendanceStats = {
  totalDaysAbsent: 3,
  totalLateArrivals: 2,
  attendanceRate: 95,
  justifiedAbsences: 2,
  unjustifiedAbsences: 1,
}

const mockAbsences: Absence[] = [
  {
    id: 'abs1',
    date: '15/01/2025',
    type: 'absence',
    status: 'justified',
    reason: 'Maladie - Justifiée',
  },
  {
    id: 'abs2',
    date: '22/12/2024',
    type: 'absence',
    status: 'justified',
    reason: 'Rendez-vous médical',
  },
  {
    id: 'late1',
    date: '10/01/2025',
    type: 'late',
    status: 'unjustified',
    duration: '30 minutes',
  },
]

export function AttendanceTab({ student: _student, isLoading }: AttendanceTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchAttendanceData(student.id) }, [student.id])

  return (
    <Card>
      <div className="space-y-6">
        <AttendanceSummary
          stats={mockStats}
          isLoading={isLoading}
        />

        <AbsenceHistory
          absences={mockAbsences}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}

export { AbsenceHistory } from './AbsenceHistory'
export type { Absence } from './AbsenceHistory'
// Re-export sub-components and types for direct access
export { AttendanceSummary } from './AttendanceSummary'
export type { AttendanceStats } from './AttendanceSummary'
