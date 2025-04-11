'use client'

import type { RevenueVsCostData } from '@/types/accounting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import { getRevenueVsCostData } from '@/services/accountingService'
import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

export function RevenueVsCostChart() {
  const { user } = useUser()
  const [data, setData] = useState<RevenueVsCostData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      if (!user?.school.id)
        return

      try {
        setIsLoading(true)
        setError(null)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setMonth(endDate.getMonth() - 11) // Last 12 months

        const chartData = await getRevenueVsCostData(
          user.school.id,
          startDate,
          endDate,
        )
        setData(chartData)
      }
      catch (err) {
        console.error('Error fetching revenue vs cost data:', err)
        setError('Failed to load chart data')
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.school.id])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenus vs Coût</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenus vs Coût</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus vs Coût</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={400} height={300} data={data}>
          <XAxis dataKey="month" />
          <YAxis tickFormatter={value => formatCurrency(value)} />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={label => `Mois: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenus"
            stroke="#8884d8"
          />
          <Line
            type="monotone"
            dataKey="cost"
            name="Coût"
            stroke="#82ca9d"
          />
        </LineChart>
      </CardContent>
    </Card>
  )
}
