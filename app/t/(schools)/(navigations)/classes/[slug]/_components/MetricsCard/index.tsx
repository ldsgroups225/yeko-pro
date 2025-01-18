import type { IClassDetailsStats } from '@/types'
import { AttendanceMetrics } from './AttendanceMetrics'
import { AverageGradeMetrics } from './AverageGradeMetrics'
import { MetricsCardsSkeleton } from './MetricsCardsSkeleton'
import { PerformanceMetrics } from './PerformanceMetrics'
import { StudentMetricsCard } from './StudentMetrics'

interface MetricsCardProps {
  stats: IClassDetailsStats | null
}

export function MetricsCards({ stats }: MetricsCardProps) {
  if (!stats)
    return <MetricsCardsSkeleton />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StudentMetricsCard stats={stats} />
      <AverageGradeMetrics stats={stats} />
      <AttendanceMetrics stats={stats} />
      <PerformanceMetrics stats={stats} />
    </div>
  )
}
