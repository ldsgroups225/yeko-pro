'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ConductRecord {
  id: number
  student: string
  class: string
  issue: string
  severity: 'Mineur' | 'Modéré' | 'Sévère'
  date: string
}

interface RecentConductsCardProps {
  conducts: ConductRecord[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export function RecentConductsCard({ conducts }: RecentConductsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-shadow">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle className="text-xl font-bold text-primary">Conduites Récentes</CardTitle>
            <CardDescription className="text-muted-foreground">Derniers incidents signalés</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {conducts.map((conduct, index) => (
              <motion.div 
                key={conduct.id} 
                className="flex items-center justify-between border-b border-border/50 pb-4 last:border-b-0"
                variants={itemVariants}
                whileHover={{ 
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{conduct.student}</p>
                  <p className="text-sm text-muted-foreground">
                    {conduct.class}
                    {' '}
                    -
                    {' '}
                    {conduct.issue}
                  </p>
                  <p className="text-xs text-muted-foreground">{conduct.date}</p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant={conduct.severity === 'Mineur' ? 'secondary' : 'destructive'}
                    className="font-medium"
                  >
                    {conduct.severity}
                  </Badge>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
