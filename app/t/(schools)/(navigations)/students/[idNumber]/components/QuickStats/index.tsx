'use client'

import type { StudentStats } from '../../types'
import { BookOpen, Clock, Heart, Wallet } from 'lucide-react'
import { nanoid } from 'nanoid'
import { QuickStatsGridSkeleton } from './QuickStatsGridSkeleton'
import { StatCard } from './StatCard'

interface QuickStatsGridProps {
  stats?: StudentStats
  isLoading?: boolean
  className?: string
}

export function QuickStatsGrid({ stats, isLoading, className = '' }: QuickStatsGridProps) {
  if (isLoading) {
    return <QuickStatsGridSkeleton />
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: 'Assiduité',
      value: `${stats.attendance}%`,
      progress: stats.attendance,
      icon: Clock,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Moyenne Générale',
      value: `${stats.average.toFixed(1)}/20`,
      progress: (stats.average / 20) * 100,
      icon: BookOpen,
      iconColor: 'text-green-500',
    },
    {
      title: 'Paiement',
      value: stats.payment.status === 'up_to_date' ? 'À jour' : 'En attente',
      progress: stats.payment.percentage,
      icon: Wallet,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Comportement',
      value: stats.behavior.status,
      progress: stats.behavior.score,
      icon: Heart,
      iconColor: 'text-red-500',
    },
  ]

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {statCards.map(stat => (
        <StatCard
          key={nanoid()}
          title={stat.title}
          value={stat.value}
          progress={stat.progress}
          icon={stat.icon}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  )
}

export { QuickStatsGridSkeleton } from './QuickStatsGridSkeleton'
// Re-export sub-components
export { StatCard } from './StatCard'
