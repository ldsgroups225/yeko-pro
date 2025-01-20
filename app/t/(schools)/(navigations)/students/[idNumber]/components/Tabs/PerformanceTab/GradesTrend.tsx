'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
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

export interface GradePoint {
  period: string
  average: number
  classAverage: number
}

interface GradesTrendProps {
  data: GradePoint[]
  isLoading?: boolean
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-sm text-blue-500">
          Note:
          {' '}
          {payload[0].value.toFixed(2)}
          /20
        </p>
        <p className="text-sm text-gray-500">
          Moyenne classe:
          {' '}
          {payload[1].value.toFixed(2)}
          /20
        </p>
      </div>
    )
  }
  return null
}

function GradeChart({ data }: { data: GradePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="period"
          className="text-muted-foreground text-xs"
        />
        <YAxis
          domain={[0, 20]}
          className="text-muted-foreground text-xs"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="average"
          name="Note"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="classAverage"
          name="Moyenne classe"
          stroke="#6b7280"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function GradeChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-muted/5 rounded-lg">
      <Skeleton className="h-full w-full" />
    </div>
  )
}

export function GradesTrend({ data, isLoading }: GradesTrendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des Notes</CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        {isLoading
          ? (
              <GradeChartSkeleton />
            )
          : (
              <GradeChart data={data} />
            )}
      </CardContent>
    </Card>
  )
}
