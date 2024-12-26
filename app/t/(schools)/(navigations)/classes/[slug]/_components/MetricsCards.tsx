import type { IClassDetailsStats } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import React from 'react'

interface IMetricsCardsProps {
  studentCount: number
  stats: IClassDetailsStats
}

export function MetricsCards({ studentCount, stats }: IMetricsCardsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Étudiants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moyenne Générale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.averageGrade?.toFixed(2) || '0.00'}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux d'Absences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.absentRate?.toFixed(1) || '0.0'}
            %
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de Retards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.lateRate?.toFixed(1) || '0.0'}
            %
          </div>
        </CardContent>
      </Card>
    </>
  )
}
