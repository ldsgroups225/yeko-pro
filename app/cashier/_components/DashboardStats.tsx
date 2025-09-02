import {
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats } from '../actions/cashierServices'

export async function DashboardStats() {
  const stats = await getDashboardStats()

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`
  }

  const getStatusColor = (overdue: number, total: number) => {
    const percentage = (overdue / total) * 100
    if (percentage <= 10)
      return 'bg-green-700 dark:bg-green-500'
    if (percentage <= 25)
      return 'bg-yellow-700 dark:bg-yellow-500'
    return 'bg-red-700 dark:bg-red-500'
  }

  const statsCards = [
    {
      title: 'Encaissements Aujourd\'hui',
      value: formatCurrency(stats.todayCollection),
      description: `${stats.todayTransactionCount} transactions`,
      icon: DollarSign,
      trend: '+12%',
      trendLabel: 'vs hier',
    },
    {
      title: 'Cette Semaine',
      value: formatCurrency(stats.weeklyCollection),
      description: 'Recettes hebdomadaires',
      icon: TrendingUp,
      trend: '+8%',
      trendLabel: 'vs semaine dernière',
    },
    {
      title: 'Ce Mois',
      value: formatCurrency(stats.monthlyCollection),
      description: 'Recettes mensuelles',
      icon: Calendar,
      trend: '+15%',
      trendLabel: 'vs mois dernier',
    },
    {
      title: 'Étudiants Actifs',
      value: stats.totalActiveStudents.toString(),
      description: `${stats.overdueStudents} impayés`,
      icon: Users,
      status: getStatusColor(stats.overdueStudents, stats.totalActiveStudents),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card) => {
        const Icon = card.icon

        return (
          <Card
            key={nanoid()}
            className="border-border/30 shadow-glass bg-card/25 backdrop-blur-lg"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {card.title}
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-primary-foreground dark:text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-2xl font-bold text-card-foreground mb-1">
                {card.value}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                {card.trend && (
                  <div className="flex items-center space-x-1">
                    <Badge className="text-xs dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30 bg-green-500/40 text-green-700 border-green-500/50">
                      {card.trend}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{card.trendLabel}</span>
                  </div>
                )}
                {card.status && (
                  <div className={`w-3 h-3 rounded-full ${card.status}`} />
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
