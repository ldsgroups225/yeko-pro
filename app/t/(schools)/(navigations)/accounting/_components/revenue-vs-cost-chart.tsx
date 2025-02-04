'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { month: 'Jan', revenue: 4000, cost: 2400 },
  { month: 'Fév', revenue: 3000, cost: 1398 },
  { month: 'Mar', revenue: 2000, cost: 9800 },
  { month: 'Avr', revenue: 2780, cost: 3908 },
  { month: 'Mai', revenue: 1890, cost: 4800 },
  { month: 'Juin', revenue: 2390, cost: 3800 },
  { month: 'Juil', revenue: 3490, cost: 4300 },
  { month: 'Août', revenue: 2900, cost: 3400 },
  { month: 'Sept', revenue: 3600, cost: 4600 },
  { month: 'Oct', revenue: 4300, cost: 5200 },
  { month: 'Nov', revenue: 4900, cost: 6100 },
  { month: 'Dec', revenue: 5500, cost: 6700 },
]

export function RevenueVsCostChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus vs Coût</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={400} height={300} data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          <Line type="monotone" dataKey="cost" stroke="#82ca9d" />
        </LineChart>
      </CardContent>
    </Card>
  )
}
