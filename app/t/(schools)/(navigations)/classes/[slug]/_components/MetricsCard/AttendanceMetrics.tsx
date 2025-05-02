import type { IClassDetailsStats } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock } from 'lucide-react'

interface AttendanceMetricsProps {
  stats: Pick<IClassDetailsStats, 'absentCount' | 'lateCount'>
}

export function AttendanceMetrics({ stats }: AttendanceMetricsProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Assiduité</p>
            <p className="text-2xl font-bold">
              {stats.absentCount}
            </p>
          </div>
          <Clock className="h-8 w-8 text-orange-500" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Absences</span>
            <Badge variant="outline" className="bg-red-500/10">
              {stats.absentCount}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span>Retards</span>
            <Badge variant="outline" className="bg-yellow-500/10">
              {stats.lateCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
