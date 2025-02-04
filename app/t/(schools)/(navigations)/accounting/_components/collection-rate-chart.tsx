'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

const data = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Fév', revenue: 3000 },
  { month: 'Mar', revenue: 2000 },
  { month: 'Avr', revenue: 2780 },
  { month: 'Mai', revenue: 1890 },
  { month: 'Juin', revenue: 2390 },
  { month: 'Juil', revenue: 3490 },
  { month: 'Août', revenue: 2900 },
  { month: 'Sept', revenue: 3600 },
  { month: 'Oct', revenue: 4300 },
  { month: 'Nov', revenue: 4900 },
  { month: 'Dec', revenue: 5500 },
]

export function CollectionRateChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Taux de Recouvrement</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={400} height={300} data={data}>
          <XAxis dataKey="month" />
          <YAxis domain={[0, 'dataMax']} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        </LineChart>
      </CardContent>
    </Card>
  )
}
