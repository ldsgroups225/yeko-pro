'use client'

import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface StatCardProps {
  title: string
  value: string
  progress: number
  icon: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({
  title,
  value,
  progress,
  icon: Icon,
  iconColor = 'text-blue-500',
  className = '',
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <Progress
          value={progress}
          className="mt-2"
          aria-label={`${title} progress: ${progress}%`}
        />
      </CardContent>
    </Card>
  )
}
