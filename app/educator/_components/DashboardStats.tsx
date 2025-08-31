import { AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react'
import * as motion from 'motion/react-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getEducatorStats } from '../actions'

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
    },
  },
}

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.5,
      delay: 0.2,
    },
  },
}

export async function DashboardStats() {
  const stats = await getEducatorStats()

  const cards = [
    {
      title: 'Total Élèves',
      value: stats.totalStudents,
      description: 'Inscrits cette année',
      icon: Users,
      color: 'primary',
      delay: 0.1,
    },
    {
      title: 'Présents Aujourd\'hui',
      value: stats.presentToday,
      description: `${Math.round((stats.presentToday / stats.totalStudents) * 100)}% de présence`,
      icon: CheckCircle,
      color: 'green',
      delay: 0.2,
    },
    {
      title: 'Absents',
      value: stats.absentToday,
      description: 'À suivre aujourd\'hui',
      icon: Clock,
      color: 'orange',
      delay: 0.3,
    },
    {
      title: 'Problèmes de Conduite',
      value: stats.conductIssues,
      description: 'Cette semaine',
      icon: AlertTriangle,
      color: 'red',
      delay: 0.4,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: card.delay }}
          whileHover={{
            y: -5,
            transition: { duration: 0.2 },
          }}
        >
          <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">{card.title}</CardTitle>
              <motion.div
                className={`rounded-full p-2 ${
                  card.color === 'primary'
                    ? 'bg-primary/10'
                    : card.color === 'green'
                      ? 'bg-green-100 dark:bg-green-900/20'
                      : card.color === 'orange'
                        ? 'bg-orange-100 dark:bg-orange-900/20'
                        : 'bg-red-100 dark:bg-red-900/20'
                }`}
                variants={iconVariants}
                initial="hidden"
                animate="visible"
              >
                <card.icon className={`h-4 w-4 ${
                  card.color === 'primary'
                    ? 'text-primary'
                    : card.color === 'green'
                      ? 'text-green-600 dark:text-green-400'
                      : card.color === 'orange'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-red-600 dark:text-red-400'
                }`}
                />
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                className={`text-2xl font-bold ${
                  card.color === 'primary'
                    ? 'text-primary'
                    : card.color === 'green'
                      ? 'text-green-600 dark:text-green-400'
                      : card.color === 'orange'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-red-600 dark:text-red-400'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: card.delay + 0.3, duration: 0.4 }}
              >
                {card.value}
              </motion.div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
