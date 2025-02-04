import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { AlertCircle, CheckCircle, DollarSign, Percent, Users } from 'lucide-react'

interface StatisticCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
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

export function FinancialStatistics() {
  // TODO: Replace with actual data from API
  const stats = [
    {
      title: 'Revenue',
      value: formatCurrency(45231.89),
      description: '+20.1% du mois dernier',
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Impayée',
      value: formatCurrency(12234.00),
      description: 'De 156 élèves',
      icon: <AlertCircle className="h-4 w-4 text-destructive" />,
    },
    {
      title: 'Recouvrement',
      value: '78.2%',
      description: '+4.1% du mois dernier',
      icon: <Percent className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Paiements à jour',
      value: '342',
      description: 'Étudiants à jour',
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    },
    {
      title: 'Retard de Paiement',
      value: '156',
      description: 'Étudiants avec des paiements en retard',
      icon: <Users className="h-4 w-4 text-yellow-500" />,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map(stat => (
        <StatisticCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
