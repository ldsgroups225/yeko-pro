import type { IClassDetailsStats } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Clock, TrendingUp } from 'lucide-react'
import { Line, LineChart } from 'recharts'

interface PerformanceMetricsProps {
  stats: Pick<IClassDetailsStats, 'performanceData'>
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Performance</p>
            <p className="text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-green-500 inline-block mr-2" />
              +5.2%
            </p>
          </div>
          <Award className="h-8 w-8 text-purple-500" />
        </div>
        <div className="mt-4">
          <div className="text-sm text-muted-foreground mb-2">Progression sur 3 mois</div>
          <LineChart width={200} height={60} data={stats.performanceData}>
            <Line type="monotone" dataKey="average" stroke="#8884d8" strokeWidth={2} dot={false} />
          </LineChart>
        </div>
      </CardContent>
    </Card>
  )
}
