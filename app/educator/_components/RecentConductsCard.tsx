// app/educator/_components/RecentConductsCard.tsx

import type { IConductStudent } from '../types'
import * as motion from 'motion/react-client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getEducatorConductStudents } from '../actions'

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

export async function RecentConductsCard() {
  const { students } = await getEducatorConductStudents({ limit: 5 })

  // Get students with recent incidents
  const studentsWithIncidents = students.filter((student: IConductStudent) => student.recentIncidents.length > 0).slice(0, 5)

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
            {studentsWithIncidents.length > 0
              ? (
                  studentsWithIncidents.map((student: IConductStudent) => {
                    const latestIncident = student.recentIncidents[0]
                    return (
                      <motion.div
                        key={student.id}
                        className="flex items-center justify-between border-b border-border/50 pb-4 last:border-b-0"
                        variants={itemVariants}
                        whileHover={{
                          x: 5,
                          transition: { duration: 0.2 },
                        }}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {student.firstName}
                            {' '}
                            {student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.className}
                            {' '}
                            -
                            {' '}
                            {latestIncident?.description || 'Aucun incident récent'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {latestIncident
                              ? new Date(latestIncident.reportedAt).toLocaleDateString('fr-FR')
                              : new Date().toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge
                            variant={student.currentScore.grade === 'TRES_BONNE' || student.currentScore.grade === 'BONNE'
                              ? 'secondary'
                              : 'destructive'}
                            className="font-medium"
                          >
                            {student.currentScore.grade === 'TRES_BONNE' || student.currentScore.grade === 'BONNE'
                              ? 'Mineur'
                              : student.currentScore.grade === 'PASSABLE'
                                ? 'Modéré'
                                : 'Sévère'}
                          </Badge>
                        </motion.div>
                      </motion.div>
                    )
                  })
                )
              : (
                  <motion.div
                    variants={itemVariants}
                    className="text-center py-8"
                  >
                    <p className="text-muted-foreground">Aucun incident récent</p>
                  </motion.div>
                )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
