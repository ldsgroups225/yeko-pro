'use client'

import type { PendingInscription } from '../actions'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, TrendingUp, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConductsManagement } from './ConductsManagement'
import { InscriptionsManagement } from './InscriptionsManagement'

interface EducatorTabsProps {
  children: React.ReactNode
  inscriptions: PendingInscription[]
}

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
}

export function EducatorTabs({ children, inscriptions }: EducatorTabsProps) {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50 backdrop-blur-sm">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  Tableau de Bord
                </TabsTrigger>
                <TabsTrigger
                  value="conducts"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Conduites
                </TabsTrigger>
                <TabsTrigger
                  value="inscriptions"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  Inscriptions
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="dashboard" className="space-y-8">
                    {children}
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === 'conducts' && (
                <motion.div
                  key="conducts"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="conducts" className="space-y-6">
                    <ConductsManagement />
                  </TabsContent>
                </motion.div>
              )}

              {activeTab === 'inscriptions' && (
                <motion.div
                  key="inscriptions"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="inscriptions" className="space-y-6">
                    <InscriptionsManagement inscriptions={inscriptions} />
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
