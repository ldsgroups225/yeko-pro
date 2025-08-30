// app/educator/_components/EducatorInscriptionStatsCards.tsx

'use client'

import type { IInscriptionStats } from '../types/inscription'
import { motion } from 'framer-motion'
import {
  Building,
  Bus,
  Calendar,
  Clock,
  Heart,
  UserCheck,
  Users,
  UtensilsCrossed,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EducatorInscriptionStatsCardsProps {
  stats: IInscriptionStats
}

export function EducatorInscriptionStatsCards({ stats }: EducatorInscriptionStatsCardsProps) {
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

  const primaryCards = [
    {
      title: 'Total Inscriptions',
      value: stats.totalInscriptions,
      description: 'Cette année scolaire',
      icon: Users,
      color: 'primary',
      delay: 0.1,
    },
    {
      title: 'Inscriptions Actives',
      value: stats.activeInscriptions,
      description: `${stats.totalInscriptions > 0 ? Math.round((stats.activeInscriptions / stats.totalInscriptions) * 100) : 0}% du total`,
      icon: UserCheck,
      color: 'green',
      delay: 0.2,
    },
    {
      title: 'En Attente',
      value: stats.pendingInscriptions,
      description: 'À traiter',
      icon: Clock,
      color: 'orange',
      delay: 0.3,
    },
    {
      title: 'Ce Mois',
      value: stats.thisMonthInscriptions,
      description: 'Nouvelles inscriptions',
      icon: Calendar,
      color: 'blue',
      delay: 0.4,
    },
  ]

  const secondaryCards = [
    {
      title: 'Élèves Orphelins',
      value: stats.orphanStudents,
      description: 'Bénéficient de réductions',
      icon: Heart,
      color: 'pink',
      delay: 0.5,
    },
    {
      title: 'Non orienté',
      value: stats.totalInscriptions - stats.governmentAffectedStudents,
      description: 'Élèves non orientés',
      icon: Building,
      color: 'purple',
      delay: 0.6,
    },
    {
      title: 'Cantine',
      value: stats.canteenSubscriptions,
      description: 'Abonnements cantine',
      icon: UtensilsCrossed,
      color: 'amber',
      delay: 0.7,
    },
    {
      title: 'Transport',
      value: stats.transportationSubscriptions,
      description: 'Abonnements transport',
      icon: Bus,
      color: 'cyan',
      delay: 0.8,
    },
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          iconBg: 'bg-primary/10',
        }
      case 'green':
        return {
          bg: 'bg-green-100 dark:bg-green-900/20',
          text: 'text-green-600 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-900/20',
        }
      case 'orange':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          text: 'text-orange-600 dark:text-orange-400',
          iconBg: 'bg-orange-100 dark:bg-orange-900/20',
        }
      case 'blue':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          text: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
        }
      case 'pink':
        return {
          bg: 'bg-pink-100 dark:bg-pink-900/20',
          text: 'text-pink-600 dark:text-pink-400',
          iconBg: 'bg-pink-100 dark:bg-pink-900/20',
        }
      case 'purple':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/20',
          text: 'text-purple-600 dark:text-purple-400',
          iconBg: 'bg-purple-100 dark:bg-purple-900/20',
        }
      case 'amber':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/20',
          text: 'text-amber-600 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-900/20',
        }
      case 'cyan':
        return {
          bg: 'bg-cyan-100 dark:bg-cyan-900/20',
          text: 'text-cyan-600 dark:text-cyan-400',
          iconBg: 'bg-cyan-100 dark:bg-cyan-900/20',
        }
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/20',
          text: 'text-gray-600 dark:text-gray-400',
          iconBg: 'bg-gray-100 dark:bg-gray-900/20',
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {primaryCards.map((card) => {
          const colors = getColorClasses(card.color)
          return (
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
                    className={`rounded-full p-2 ${colors.iconBg}`}
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <card.icon className={`h-4 w-4 ${colors.text}`} />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.div
                    className={`text-2xl font-bold ${colors.text}`}
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
          )
        })}
      </div>

      {/* Secondary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Services & Aides</h3>
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent flex-1 ml-4" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {secondaryCards.map((card) => {
            const colors = getColorClasses(card.color)
            return (
              <motion.div
                key={card.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: card.delay }}
                whileHover={{
                  y: -3,
                  transition: { duration: 0.2 },
                }}
              >
                <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{card.title}</p>
                        <motion.div
                          className={`text-xl font-bold ${colors.text}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: card.delay + 0.2, duration: 0.3 }}
                        >
                          {card.value}
                        </motion.div>
                        <p className="text-xs text-muted-foreground">{card.description}</p>
                      </div>
                      <motion.div
                        className={`rounded-lg p-2 ${colors.iconBg}`}
                        variants={iconVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <card.icon className={`h-5 w-5 ${colors.text}`} />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
