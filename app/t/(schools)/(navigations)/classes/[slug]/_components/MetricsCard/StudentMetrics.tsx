import type { IClassDetailsStats } from '@/types'
import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface StudentMetricsCardProps {
  stats: Pick<IClassDetailsStats, 'totalStudents' | 'boyCount' | 'girlCount'>
}

export function StudentMetricsCard({ stats }: StudentMetricsCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Élèves</p>
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
          </div>
          <Users className="h-8 w-8 text-blue-500" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Garçons</span>
            <span>{stats.boyCount}</span>
          </div>
          <Progress value={(stats.boyCount / stats.totalStudents) * 100} className="bg-blue-100" />
          <div className="flex justify-between text-sm">
            <span>Filles</span>
            <span>{stats.girlCount}</span>
          </div>
          <Progress value={(stats.girlCount / stats.totalStudents) * 100} className="bg-pink-100" />
        </div>
      </CardContent>
    </Card>
  )
}
