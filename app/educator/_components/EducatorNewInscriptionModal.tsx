// app/educator/_components/EducatorNewInscriptionModal.tsx

'use client'

import type { NewInscriptionFormData } from '../schemas/inscription'
import type { IClass, IGrade, IStudentSearchResult } from '../types/inscription'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Bus, GraduationCap, Heart, Phone, User, UtensilsCrossed } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { FormFieldWrapper } from '@/app/inscriptions/components/FormFieldWrapper'
import { MedicalConditionInput } from '@/app/inscriptions/components/MedicalConditionInput'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { normalizeCIPhoneNumber } from '@/lib/utils/phoneUtils'
import { createOrUpdateStudent, enrollStudent } from '../actions'
import { newInscriptionSchema } from '../schemas/inscription'

interface EducatorNewInscriptionModalProps {
  schoolId: string
  grades: IGrade[]
  classes: IClass[]
  onClose: () => void
  onInscriptionCreated: () => void
  prefilledStudent?: IStudentSearchResult | null
}

export function EducatorNewInscriptionModal({
  grades,
  classes,
  schoolId,
  onClose,
  onInscriptionCreated,
  prefilledStudent,
}: EducatorNewInscriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasMedicalCondition, setHasMedicalCondition] = useState(false)

  const form = useForm<NewInscriptionFormData>({
    resolver: zodResolver(newInscriptionSchema),
    defaultValues: {
      studentFirstName: prefilledStudent?.firstName || '',
      studentLastName: prefilledStudent?.lastName || '',
      studentGender: (prefilledStudent?.gender as 'M' | 'F') || 'M',
      studentBirthDate: prefilledStudent?.birthDate || '',
      studentAddress: prefilledStudent?.address || '',
      studentIdNumber: prefilledStudent?.idNumber || '',
      parentPhone: '',
      secondParent: prefilledStudent?.extraParent
        ? {
            fullName: prefilledStudent.extraParent.fullName || '',
            phone: prefilledStudent.extraParent.phone || '',
            gender: (prefilledStudent.extraParent.gender as 'M' | 'F') || 'M',
            type: prefilledStudent.extraParent.type || 'guardian',
          }
        : undefined,
      gradeId: 0,
      classId: '',
      isGovernmentAffected: false,
      isOrphan: false,
      isSubscribedToCanteen: false,
      isSubscribedToTransportation: false,
      medicalConditions: prefilledStudent?.medicalCondition || [],
    },
  })

  const watchedGradeId = form.watch('gradeId')

  const getFilteredClasses = () => {
    if (!watchedGradeId || !classes || classes.length === 0)
      return []
    return classes.filter(cls => cls.gradeId === watchedGradeId)
  }

  const handleSubmit = async (data: NewInscriptionFormData) => {
    try {
      setIsSubmitting(true)

      // Validate that the selected class belongs to the selected grade
      if (data.classId && data.classId !== '') {
        const selectedClass = classes.find(cls => cls.id === data.classId)
        if (selectedClass && selectedClass.gradeId !== data.gradeId) {
          toast.error('La classe sélectionnée ne correspond pas au niveau choisi')
          return
        }
      }

      const normalizedParentPhone = normalizeCIPhoneNumber(data.parentPhone)
      const normalizedSecondParent = data.secondParent
        ? {
            fullName: data.secondParent.fullName,
            gender: data.secondParent.gender,
            phone: normalizeCIPhoneNumber(data.secondParent.phone)!,
            type: data.secondParent.type,
          }
        : undefined

      const studentId = await createOrUpdateStudent({
        birthDate: data.studentBirthDate,
        firstName: data.studentFirstName,
        lastName: data.studentLastName,
        gender: data.studentGender,
        idNumber: data.studentIdNumber,
        parentPhone: normalizedParentPhone!,
        medicalCondition: data.medicalConditions || [],
        secondParent: normalizedSecondParent,
        address: data.studentAddress,
      })

      await enrollStudent({
        studentId,
        schoolId,
        gradeId: data.gradeId,
        isStateAssigned: data.isGovernmentAffected,
        isOrphan: data.isOrphan,
        hasCanteenSubscription: data.isSubscribedToCanteen,
        hasTransportSubscription: data.isSubscribedToTransportation,
      })

      toast.success('Inscription créée avec succès')
      form.reset()
      onInscriptionCreated()
      onClose()
    }
    catch (error) {
      console.error('Error creating inscription:', error)
      toast.error('Erreur lors de la création de l\'inscription')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-primary flex items-center">
          <User className="h-5 w-5 mr-2" />
          {prefilledStudent ? 'Inscription d\'Élève Existant' : 'Nouvelle Inscription d\'Élève'}
        </DialogTitle>
        {prefilledStudent && (
          <p className="text-sm text-muted-foreground">
            Inscription de
            {' '}
            {prefilledStudent.firstName}
            {' '}
            {prefilledStudent.lastName}
            {' '}
            (#
            {prefilledStudent.idNumber}
            )
          </p>
        )}
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Student Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Informations de l'élève</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentFirstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Prénom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Prénom de l'élève"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Nom *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom de l'élève"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentGender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Genre *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="studentBirthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Date de naissance *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Matricule</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Matricule (optionnel, généré automatiquement)"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Contact du parent *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Numéro de téléphone du parent direct"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="studentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Adresse</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adresse complète de l'élève"
                      className="bg-background/50 backdrop-blur-sm border-border/50"
                      rows={2}
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>

          {/* Medical Condition Section */}
          <div className="space-y-2">
            <FormLabel>L'élève a-t-il une condition médicale particulière ?</FormLabel>
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant={hasMedicalCondition ? 'default' : 'outline'}
                onClick={() => setHasMedicalCondition(true)}
                disabled={isSubmitting}
              >
                Oui
              </Button>
              <span className="text-sm text-muted-foreground">ou</span>
              <Button
                type="button"
                variant={!hasMedicalCondition ? 'default' : 'outline'}
                onClick={() => {
                  setHasMedicalCondition(false)
                  form.setValue('medicalConditions', [])
                }}
                disabled={isSubmitting}
              >
                Non
              </Button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {hasMedicalCondition && (
              <motion.div
                key="medical-condition-input"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
                className="mt-4"
              >
                <FormFieldWrapper
                  control={form.control}
                  name="medicalConditions"
                  label="Condition médicale (optionnel)"
                >
                  {({ field }) => (
                    <MedicalConditionInput
                      value={field.value || []}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  )}
                </FormFieldWrapper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parent Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Informations du tuteur (optionnel)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="secondParent.fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Nom complet</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom complet du tuteur"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondParent.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+225 XX XX XX XX"
                        className="bg-background/50 backdrop-blur-sm border-border/50"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondParent.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Type de parent</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="father">Père</SelectItem>
                        <SelectItem value="mother">Mère</SelectItem>
                        <SelectItem value="guardian">Tuteur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondParent.gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Genre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={isSubmitting}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                          <SelectValue placeholder="Sélectionner le genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          <div className="px-6 py-3 bg-secondary/40 backdrop-blur-sm rounded-lg border border-border/20 shadow-sm">
            {/* Academic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Informations académiques</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gradeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Niveau *</FormLabel>
                      <Select
                        onValueChange={value => field.onChange(Number.parseInt(value))}
                        value={field.value && field.value > 0 ? field.value.toString() : ''}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                            <SelectValue placeholder="Sélectionner un niveau" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades && grades.length > 0
                            ? grades.map(grade => (
                                <SelectItem key={grade.id} value={grade.id.toString()}>
                                  {grade.name}
                                </SelectItem>
                              ))
                            : (
                                <SelectItem value="" disabled>
                                  Aucun niveau disponible
                                </SelectItem>
                              )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="classId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Classe</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ? field.value.toString() : ''}
                        disabled={!watchedGradeId || isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/50 backdrop-blur-sm border-border/50">
                            <SelectValue placeholder="Sélectionner une classe" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="-">Aucune classe spécifique</SelectItem>
                          {getFilteredClasses() && getFilteredClasses().length > 0
                            ? getFilteredClasses().map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))
                            : (
                                <SelectItem value="--" disabled>
                                  Aucune classe disponible pour ce niveau
                                </SelectItem>
                              )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </motion.div>

            {/* Special Status & Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold">Statuts spéciaux et services</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <label className="text-sm font-medium">Est-ce un orienté ?</label>
                        <p className="text-xs text-muted-foreground">Élève bénéficiant de subventions d'état</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="isGovernmentAffected"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-pink-600" />
                      <div>
                        <label className="text-sm font-medium">Élève orphelin</label>
                        <p className="text-xs text-muted-foreground">Bénéficie de réductions spéciales</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="isOrphan"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
                    <div className="flex items-center space-x-3">
                      <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                      <div>
                        <label className="text-sm font-medium">Abonnement cantine</label>
                        <p className="text-xs text-muted-foreground">Service de restauration scolaire</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="isSubscribedToCanteen"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/20">
                    <div className="flex items-center space-x-3">
                      <Bus className="h-5 w-5 text-green-600" />
                      <div>
                        <label className="text-sm font-medium">Abonnement transport</label>
                        <p className="text-xs text-muted-foreground">Service de transport scolaire</p>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="isSubscribedToTransportation"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex justify-end space-x-4 pt-6 border-t border-border/20"
            >
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? 'Création...' : 'Créer l\'inscription'}
              </Button>
            </motion.div>
          </div>
        </form>
      </Form>
    </DialogContent>
  )
}
