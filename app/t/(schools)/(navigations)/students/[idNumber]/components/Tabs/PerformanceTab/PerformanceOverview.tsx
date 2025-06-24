'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

export interface PerformanceMetric {
  id: string
  name: string
  currentValue: number
  previousValue?: number
  maxValue: number
  trend?: 'up' | 'down' | 'stable'
  category: 'academic' | 'behavior' | 'participation'
}

interface PerformanceOverviewProps {
  metrics: PerformanceMetric[]
  isLoading?: boolean
}

function TrendIndicator({ trend }: { trend?: PerformanceMetric['trend'] }) {
  if (!trend)
    return null

  const icons = {
    up: <ArrowUp className="h-4 w-4 text-green-500" />,
    down: <ArrowDown className="h-4 w-4 text-red-500" />,
    stable: <Minus className="h-4 w-4 text-yellow-500" />,
  }

  return icons[trend]
}

function MetricCard({ metric }: { metric: PerformanceMetric }) {
  const progress = (metric.currentValue / metric.maxValue) * 100
  const colorVariants = {
    academic: 'text-blue-500',
    behavior: 'text-purple-500',
    participation: 'text-green-500',
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-sm font-medium text-muted-foreground">
              {metric.name}
            </div>
            <div className="text-2xl font-bold">
              {metric.currentValue.toFixed(2).endsWith('.00') ? metric.currentValue : metric.currentValue.toFixed(2)}
              {
                metric.name !== 'Participation'
                  ? `/${metric.maxValue}`
                  : ''
              }
            </div>
          </div>
          {metric.trend && (
            <div className="flex items-center gap-1">
              <TrendIndicator trend={metric.trend} />
              {metric.previousValue && (
                <span className="text-sm text-muted-foreground">
                  vs
                  {' '}
                  {metric.previousValue.toFixed(2).endsWith('.00') ? metric.previousValue : metric.previousValue.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
        <Progress
          value={progress}
          className={`h-2 ${colorVariants[metric.category]}`}
          aria-label={`${metric.name} progress`}
        />
      </CardContent>
    </Card>
  )
}

function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-2 w-full mt-4" />
      </CardContent>
    </Card>
  )
}

export function PerformanceOverview({ metrics, isLoading }: PerformanceOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map(metric => (
        <MetricCard key={metric.id} metric={metric} />
      ))}
    </div>
  )
}
