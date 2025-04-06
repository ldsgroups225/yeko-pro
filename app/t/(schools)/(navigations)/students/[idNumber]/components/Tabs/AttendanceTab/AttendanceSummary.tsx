'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export interface AttendanceStats {
  totalDaysAbsent: number
  totalLateArrivals: number
  attendanceRate: number
  justifiedAbsences: number
  unjustifiedAbsences: number
}

interface AttendanceSummaryProps {
  stats: AttendanceStats
  isLoading?: boolean
}

interface StatRowProps {
  label: string
  value: React.ReactNode
  className?: string
}

function StatRow({ label, value, className = '' }: StatRowProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="font-medium">
        {label}
        :
      </span>
      {typeof value === 'number'
        ? (
            <Badge variant="outline">{value}</Badge>
          )
        : (
            value
          )}
    </div>
  )
}

function StatRowSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

export function AttendanceSummary({ stats, isLoading }: AttendanceSummaryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suivi de Présence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <StatRowSkeleton />
            <StatRowSkeleton />
            <StatRowSkeleton />
            <Skeleton className="h-2 w-full mt-4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi de Présence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <StatRow
              label="Total jours d'absence"
              value={stats.totalDaysAbsent}
            />
            <StatRow
              label="Retards"
              value={stats.totalLateArrivals}
            />
            <StatRow
              label="Taux de présence"
              value={(
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {stats.attendanceRate.toFixed(2)}
                    %
                  </Badge>
                  <Progress
                    value={stats.attendanceRate}
                    className="w-20"
                    aria-label="Taux de présence"
                  />
                </div>
              )}
            />
          </div>

          <div className="space-y-4">
            <StatRow
              label="Absences justifiées"
              value={stats.justifiedAbsences}
            />
            <StatRow
              label="Absences non justifiées"
              value={stats.unjustifiedAbsences}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
