import * as motion from 'motion/react-client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPendingInscriptions } from '../actions'

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

export async function PendingInscriptionsCard() {
  const inscriptions = await getPendingInscriptions()

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
            <CardTitle className="text-xl font-bold text-primary">Inscriptions en Attente</CardTitle>
            <CardDescription className="text-muted-foreground">Nouveaux élèves à traiter</CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {inscriptions.map(inscription => (
              <motion.div
                key={inscription.candidateId}
                className="flex items-center justify-between border-b border-border/50 pb-4 last:border-b-0"
                variants={itemVariants}
                whileHover={{
                  x: 5,
                  transition: { duration: 0.2 },
                }}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">{inscription.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Parent:
                    {' '}
                    {inscription.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Classe:
                    {' '}
                    {inscription.grade}
                    {' '}
                    •
                    {' '}
                    {inscription.time}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant={inscription.status === 'En attente' ? 'secondary' : 'destructive'}
                    className="font-medium"
                  >
                    {inscription.status}
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
