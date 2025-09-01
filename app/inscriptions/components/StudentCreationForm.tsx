// app/inscriptions/components/StudentCreationForm.tsx

import type { SubmitHandler } from 'react-hook-form'
import type { StudentCreationFormData } from '../schemas'
import type { IStudent } from '../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarIcon, ChevronDown, ChevronUp, Phone } from 'lucide-react'
import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { ImageUpload } from '@/components/ImageUpload'
import { PhoneInput } from '@/components/PhoneInput'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { maxBirthDate, minBirthDate } from '@/constants'
import { cn } from '@/lib/utils'
import { normalizeCIPhoneNumber } from '@/lib/utils/phoneUtils'
import { createStudent } from '../actions'
import { studentCreationSchema } from '../schemas'
import { FormFieldWrapper } from './FormFieldWrapper'
import { MedicalConditionInput } from './MedicalConditionInput'

interface StudentCreationFormProps {
  onSuccess: (student: IStudent) => void
  onCancel: () => void
}

export function StudentCreationForm({
  onSuccess,
  onCancel,
}: StudentCreationFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)

  const [isSubmitting, startSubmitting] = useTransition()
  const [showSecondParent, setShowSecondParent] = useState(false)
  const [hasMedicalCondition, setHasMedicalCondition] = useState<boolean>(false)

  const phoneInputRef = useRef<any>(null)

  const studentForm = useForm<StudentCreationFormData>({
    resolver: zodResolver(studentCreationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: undefined,
      idNumber: undefined,
      address: '',
      medicalCondition: [],
      parentPhone: '',
      secondParent: {
        fullName: '',
        phone: '',
        type: 'guardian',
        gender: 'M',
      },
    },
  })

  const onSubmit: SubmitHandler<StudentCreationFormData> = (data) => {
    startSubmitting(async () => {
      try {
        setError(null)

        const payload = {
          ...data,
          birthDate: data.birthDate.toISOString(),
          avatarUrl,
          medicalCondition: data.medicalCondition,
          parentPhone: normalizeCIPhoneNumber(data.parentPhone) || data.parentPhone,
        }

        const student = await createStudent(payload)
        onSuccess(student)
      }
      catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'élève')
      }
    })
  }

  const isLoading = isSubmitting

  return (
    <Form {...studentForm}>
      <form onSubmit={studentForm.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center mb-6">
          <ImageUpload
            value={avatarUrl ?? null}
            onChange={url => setAvatarUrl(url ?? undefined)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name using Wrapper */}
          <FormFieldWrapper
            control={studentForm.control}
            name="firstName"
            label="Prénom"
          >
            {({ field }) => (
              <Input
                placeholder="Entrez le prénom"
                {...field}
                disabled={isLoading}
              />
            )}
          </FormFieldWrapper>

          {/* Last Name using Wrapper */}
          <FormFieldWrapper
            control={studentForm.control}
            name="lastName"
            label="Nom"
          >
            {({ field }) => (
              <Input
                placeholder="Entrez le nom"
                {...field}
                disabled={isLoading}
              />
            )}
          </FormFieldWrapper>
        </div>

        <FormField
          control={studentForm.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matricule (Optionnelle)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormDescription>
                Identifiant unique de l&apos;étudiant (non modifiable)
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Gender using Wrapper */}
        <FormFieldWrapper
          control={studentForm.control}
          name="gender"
          label="Genre"
          className="space-y-3"
        >
          {({ field }) => (

            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              defaultValue={field.value}
              className="flex space-x-4"
              disabled={isLoading}

            >
              {/* Structure within RadioGroup requires FormItem/FormControl/FormLabel again */}
              {/* This is specific to RadioGroup's structure, not the wrapper */}
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="M" />
                </FormControl>
                <FormLabel className="font-normal">Masculin</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="F" />
                </FormControl>
                <FormLabel className="font-normal">Féminin</FormLabel>
              </FormItem>
            </RadioGroup>
          )}
        </FormFieldWrapper>

        {/* Birth Date using Wrapper */}
        <FormFieldWrapper
          control={studentForm.control}
          name="birthDate"
          label="Date de naissance"
        >
          {({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                {/* FormControl is handled by FormFieldWrapper, but we need the Button inside */}
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className={cn(
                    'w-full pl-3 text-left font-normal',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  {field.value
                    ? format(field.value, 'PPP', { locale: fr })
                    : <span>Choisir une date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}

                  locale={fr}
                  disabled={date =>
                    isLoading
                    || date > new Date()
                    || date < minBirthDate
                    || date > maxBirthDate}
                  initialFocus
                  captionLayout="dropdown-buttons"
                  fromYear={minBirthDate.getFullYear()}
                  toYear={maxBirthDate.getFullYear()}
                />
              </PopoverContent>
            </Popover>
          )}
        </FormFieldWrapper>

        {/* Address using Wrapper */}
        <FormFieldWrapper
          control={studentForm.control}
          name="address"
          label="Lieu d'habitation"
        >
          {({ field }) => (
            <Input
              placeholder="Entrez votre lieu d'habitation"
              {...field}
              value={field.value ?? ''}
              disabled={isLoading}
            />
          )}
        </FormFieldWrapper>

        {/* Parent Phone Field */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Phone className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Information du parent</h3>
          </div>

          <FormFieldWrapper
            control={studentForm.control}
            name="parentPhone"
            label="Numéro de téléphone du parent"
            description="Le numéro de téléphone permet de lier automatiquement l'élève à son parent."
          >
            {({ field }) => (
              <PhoneInput
                ref={phoneInputRef}
                placeholder="+225 XX XX XX XX"
                value={field.value}
                onChange={field.onChange}
                disabled={isLoading}
              />
            )}
          </FormFieldWrapper>
        </div>

        {/* Medical Condition Section */}
        <div className="space-y-2">
          <FormLabel>L'élève a-t-il une condition médicale particulière ?</FormLabel>
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant={hasMedicalCondition ? 'default' : 'outline'}
              onClick={() => setHasMedicalCondition(true)}
              disabled={isLoading}
            >
              Oui
            </Button>
            <span className="text-sm text-muted-foreground">ou</span>
            <Button
              type="button"
              variant={!hasMedicalCondition ? 'default' : 'outline'}
              onClick={() => {
                setHasMedicalCondition(false)
                studentForm.setValue('medicalCondition', [])
              }}
              disabled={isLoading}
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
                control={studentForm.control}
                name="medicalCondition"
                label="Condition médicale (optionnel)"
              >
                {({ field }) => (
                  <MedicalConditionInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                  />
                )}
              </FormFieldWrapper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Second Parent Section */}
        <div className="space-y-4 border-t pt-4">
          <Collapsible
            open={showSecondParent}
            onOpenChange={setShowSecondParent}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Deuxième parent (optionnel)</h3>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-9 p-0"
                >
                  {showSecondParent
                    ? (
                        <>
                          <span className="sr-only">Masquer</span>
                          <ChevronUp className="h-4 w-4" />
                        </>
                      )
                    : (
                        <>
                          <span className="sr-only">Afficher</span>
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                </Button>
              </CollapsibleTrigger>
            </div>

            <AnimatePresence initial={false}>
              {showSecondParent && (
                <CollapsibleContent forceMount>
                  <motion.div
                    key="second-parent-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={studentForm.control}
                          name="secondParent.fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input placeholder="Nom complet" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={studentForm.control}
                          name="secondParent.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input placeholder="Téléphone" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={studentForm.control}
                          name="secondParent.type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type de parent</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
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
                          control={studentForm.control}
                          name="secondParent.gender"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Genre</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-row space-x-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="M" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Masculin</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="F" />
                                    </FormControl>
                                    <FormLabel className="font-normal">Féminin</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                </CollapsibleContent>
              )}
            </AnimatePresence>
          </Collapsible>
        </div>

        {/* --- Error Display and Buttons remain the same --- */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {studentForm.formState.errors.root?.serverError && (
          <Alert variant="destructive">
            <AlertTitle>Erreur Serveur</AlertTitle>
            <AlertDescription>{studentForm.formState.errors.root.serverError.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !studentForm.formState.isValid}
          >
            {isSubmitting ? 'Création...' : 'Créer l\'élève'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
