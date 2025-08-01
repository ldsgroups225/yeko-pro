'use client'

import type { FinancialMetrics, FinancialStatistic } from '@/types/accounting'
import { CheckCircle, Percent, Users } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { getFinancialMetrics } from '@/services/accountingService'

interface StatisticCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode | string
}

function StatisticCard({ title, value, description, icon }: StatisticCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatisticCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[120px] mb-2" />
        <Skeleton className="h-3 w-[140px]" />
      </CardContent>
    </Card>
  )
}

export function FinancialStatistics() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getFinancialMetrics()
        setMetrics(data)
      }
      catch (err) {
        console.error('Error fetching financial metrics:', err)
        setError('Failed to load financial metrics')
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
        {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map(() => (
          <StatisticCardSkeleton key={nanoid()} />
        ))}
      </div>
    )
  }

  const stats: FinancialStatistic[] = metrics
    ? [
        {
          title: 'Chiffre attendu (ans)',
          value: formatCurrency(metrics.revenue.total, false),
          description: `${metrics.revenue.previousMonthPercentage > 0 ? '+' : ''}${metrics.revenue.previousMonthPercentage.toFixed(1)}% de l'année dernière`,
          icon: 'F CFA',
          // icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
        },
        {
          title: 'Tranche Impayée',
          value: formatCurrency(metrics.unpaidAmount.total, false),
          description: `De ${metrics.unpaidAmount.studentCount} élèves`,
          icon: 'F CFA',
          // icon: <AlertCircle className="h-4 w-4 text-destructive" />,
        },
        {
          title: 'Recouvrement',
          value: `${metrics.recoveryRate.percentage.toFixed(1)}%`,
          description: `${metrics.recoveryRate.previousMonthPercentage > 0 ? '+' : ''}${metrics.recoveryRate.previousMonthPercentage.toFixed(1)}% du mois dernier`,
          icon: <Percent className="h-4 w-4 text-muted-foreground" />,
        },
        {
          title: 'Élèves à jour',
          value: metrics.upToDatePayments.studentCount,
          description: 'Étudiants à jour',
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        },
        {
          title: 'Élèves en retard',
          value: metrics.latePayments.studentCount,
          description: 'Étudiants avec des paiements en retard',
          icon: <Users className="h-4 w-4 text-yellow-500" />,
        },
      ]
    : []

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map(stat => (
        <StatisticCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
