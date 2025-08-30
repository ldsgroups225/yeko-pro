'use client'

import type { ConductRecord } from '@/app/educator/actions'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit, Eye, Plus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ConductsManagementProps {
  conducts: ConductRecord[]
}

const tableRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
}

export function ConductsManagement({ conducts }: ConductsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')

  // Filter conducts based on search and filters
  const filteredConducts = conducts.filter((conduct) => {
    const matchesSearch = conduct.student.toLowerCase().includes(searchTerm.toLowerCase())
      || conduct.issue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || conduct.class.includes(selectedClass)
    const matchesSeverity = selectedSeverity === 'all' || conduct.severity === selectedSeverity

    return matchesSearch && matchesClass && matchesSeverity
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div>
              <CardTitle className="text-xl font-bold text-primary">Gestion des Conduites</CardTitle>
              <CardDescription className="text-muted-foreground">Suivi des comportements et incidents</CardDescription>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Nouveau Rapport
              </Button>
            </motion.div>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex items-center gap-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex-1">
              <Input
                placeholder="Rechercher un élève..."
                className="max-w-sm bg-background/50 backdrop-blur-sm border-border/50"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
                <SelectValue placeholder="Classe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                <SelectItem value="6ème">6ème</SelectItem>
                <SelectItem value="5ème">5ème</SelectItem>
                <SelectItem value="4ème">4ème</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur-sm border-border/50">
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sévérités</SelectItem>
                <SelectItem value="Mineur">Mineur</SelectItem>
                <SelectItem value="Modéré">Modéré</SelectItem>
                <SelectItem value="Sévère">Sévère</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            className="rounded-lg border border-border/50 bg-background/30 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-background/50">
                  <TableHead className="font-semibold text-foreground">Élève</TableHead>
                  <TableHead className="font-semibold text-foreground">Classe</TableHead>
                  <TableHead className="font-semibold text-foreground">Incident</TableHead>
                  <TableHead className="font-semibold text-foreground">Sévérité</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredConducts.map((conduct, index) => (
                    <motion.tr
                      key={conduct.id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-background/50"
                    >
                      <TableCell className="font-medium text-foreground">{conduct.student}</TableCell>
                      <TableCell className="text-muted-foreground">{conduct.class}</TableCell>
                      <TableCell className="text-muted-foreground">{conduct.issue}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-muted-foreground">{conduct.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
