'use client'

import type { CollectionRateData } from '@/types/accounting'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/hooks'
import { getCollectionRateData } from '@/services/accountingService'
import { useEffect, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

export function CollectionRateChart() {
  const { user } = useUser()
  const [data, setData] = useState<CollectionRateData[]>([])
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

        const chartData = await getCollectionRateData(
          user.school.id,
          startDate,
          endDate,
        )
        setData(chartData)
      }
      catch (err) {
        console.error('Error fetching collection rate data:', err)
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
          <CardTitle>Taux de Recouvrement</CardTitle>
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
          <CardTitle>Taux de Recouvrement</CardTitle>
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
        <CardTitle>Taux de Recouvrement</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart width={400} height={300} data={data}>
          <XAxis dataKey="month" />
          <YAxis
            domain={[0, 100]}
            tickFormatter={value => `${value}%`}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            labelFormatter={label => `Mois: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="rate"
            name="Taux de recouvrement"
            stroke="#8884d8"
          />
        </LineChart>
      </CardContent>
    </Card>
  )
}
