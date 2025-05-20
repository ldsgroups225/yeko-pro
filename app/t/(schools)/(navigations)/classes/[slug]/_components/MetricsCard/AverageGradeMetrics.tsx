import type { IClassDetailsStats } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GraduationCap } from 'lucide-react'

interface AverageGradeMetricsProps {
  stats: Pick<IClassDetailsStats, 'averageGrade' | 'performanceData'>
}

export function AverageGradeMetrics({ stats }: AverageGradeMetricsProps) {
  const highestGrade = Math.max(0, ...stats.performanceData.map(data => data.average))
  const lowestGrade = stats.performanceData.length > 0
    ? Math.min(...stats.performanceData.map(data => data.average))
    : 0

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Moyenne Générale</p>
            <p className="text-2xl font-bold">
              {stats.averageGrade.toFixed(2).endsWith('.00') ? stats.averageGrade : stats.averageGrade.toFixed(2)}
              /20
            </p>
          </div>
          <GraduationCap className="h-8 w-8 text-green-500" />
        </div>
        <div className="mt-4">
          <Progress value={stats.averageGrade * 5} className="mb-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Plus haute:
              {highestGrade}
            </span>
            <span>
              Plus basse:
              {lowestGrade}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
