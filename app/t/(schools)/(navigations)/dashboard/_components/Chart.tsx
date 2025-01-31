'use client'

import type { IDashboardChartProps } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function Chart({ data }: IDashboardChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Suivi de la Ponctualité</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="absences"
              stroke="hsl(var(--destructive))"
              name="Absences"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="lates"
              stroke="hsl(var(--ring))"
              name="Retards"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
