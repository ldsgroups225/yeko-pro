'use client'

import type { PendingInscription } from '../actions'
import { motion } from 'framer-motion'
import { CheckCircle, Eye, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface InscriptionsManagementProps {
  inscriptions: PendingInscription[]
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

export function InscriptionsManagement({ inscriptions }: InscriptionsManagementProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    studentAge: '',
    parentName: '',
    parentPhone: '',
    classLevel: '',
    address: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.warn('Form submitted:', formData)
    // Reset form
    setFormData({
      studentName: '',
      studentAge: '',
      parentName: '',
      parentPhone: '',
      classLevel: '',
      address: '',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <CardTitle className="text-xl font-bold text-primary">Nouvelle Inscription</CardTitle>
                <CardDescription className="text-muted-foreground">Enregistrer un nouvel élève</CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  className="grid gap-4 md:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="student-name" className="text-foreground font-medium">Nom de l'élève</Label>
                    <Input
                      id="student-name"
                      placeholder="Nom complet"
                      value={formData.studentName}
                      onChange={e => handleInputChange('studentName', e.target.value)}
                      className="bg-background/50 backdrop-blur-sm border-border/50"
                      required
                    />
                  </motion.div>
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="student-age" className="text-foreground font-medium">Âge</Label>
                    <Input
                      id="student-age"
                      type="number"
                      placeholder="Âge"
                      value={formData.studentAge}
                      onChange={e => handleInputChange('studentAge', e.target.value)}
                      className="bg-background/50 backdrop-blur-sm border-border/50"
                      required
                    />
                  </motion.div>
                </motion.div>

                <motion.div
                  className="grid gap-4 md:grid-cols-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="parent-name" className="text-foreground font-medium">Nom du parent/tuteur</Label>
                    <Input
                      id="parent-name"
                      placeholder="Nom complet"
                      value={formData.parentName}
                      onChange={e => handleInputChange('parentName', e.target.value)}
                      className="bg-background/50 backdrop-blur-sm border-border/50"
                      required
                    />
                  </motion.div>
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <Label htmlFor="parent-phone" className="text-foreground font-medium">Téléphone</Label>
                    <Input
                      id="parent-phone"
                      placeholder="+225 XX XX XX XX"
                      value={formData.parentPhone}
                      onChange={e => handleInputChange('parentPhone', e.target.value)}
                      className="bg-background/50 backdrop-blur-sm border-border/50"
                      required
                    />
                  </motion.div>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <Label htmlFor="class-level" className="text-foreground font-medium">Niveau de classe</Label>
                  <Select value={formData.classLevel} onValueChange={value => handleInputChange('classLevel', value)}>
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6eme">6ème</SelectItem>
                      <SelectItem value="5eme">5ème</SelectItem>
                      <SelectItem value="4eme">4ème</SelectItem>
                      <SelectItem value="3eme">3ème</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div className="space-y-2" variants={itemVariants}>
                  <Label htmlFor="address" className="text-foreground font-medium">Adresse</Label>
                  <Textarea
                    id="address"
                    placeholder="Adresse complète"
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    className="bg-background/50 backdrop-blur-sm border-border/50"
                    required
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Enregistrer l'inscription
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <CardTitle className="text-xl font-bold text-primary">Inscriptions Récentes</CardTitle>
                <CardDescription className="text-muted-foreground">Dernières demandes d'inscription</CardDescription>
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
                    key={inscription.id}
                    className="border border-border/50 rounded-lg p-4 bg-background/30 backdrop-blur-sm"
                    variants={itemVariants}
                    whileHover={{
                      x: 5,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{inscription.student}</h4>
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
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Parent:
                      {' '}
                      {inscription.parent}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Classe demandée:
                      {' '}
                      {inscription.class}
                    </p>
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" variant="outline" className="hover:bg-primary/10">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
