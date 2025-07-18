// app/payments/components/StudentCreationForm.tsx

import type { SubmitHandler } from 'react-hook-form'
import type { StudentCreationFormData } from '../schemas'
import type { IStudent } from '../types'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { ImageUpload } from '@/components/ImageUpload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { maxBirthDate, minBirthDate } from '@/constants'
import { cn } from '@/lib/utils'
import { checkOTP, createStudent } from '../actions'
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
  const [parentName, setParentName] = useState<string | null>(null)

  const [isOtpChecking, startOtpChecking] = useTransition()
  const [isSubmitting, startSubmitting] = useTransition()
  const [showSecondParent, setShowSecondParent] = useState(false)

  const studentForm = useForm<StudentCreationFormData>({
    resolver: zodResolver(studentCreationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: undefined,
      address: '',
      medicalCondition: [],
      secondParent: undefined,
      otp: '',
      parentId: '',
    },
  })

  const verifyOTP = (otpValue: string | undefined) => {
    if (!otpValue || otpValue.length !== 6) {
      studentForm.setError('otp', { message: 'Code OTP invalide (6 chiffres).' })
      return
    }

    startOtpChecking(async () => {
      try {
        setError(null)
        studentForm.clearErrors('otp')

        const { parentId, parentName } = await checkOTP(otpValue)

        studentForm.setValue('parentId', parentId, { shouldValidate: true })
        setParentName(parentName)
      }
      catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur de vérification OTP'
        setError(message)
        studentForm.setError('otp', { message: 'Code OTP incorrect ou expiré.' })
        studentForm.setValue('parentId', '', { shouldValidate: true })
        setParentName(null)
      }
    })
  }

  const onSubmit: SubmitHandler<StudentCreationFormData> = (data) => {
    if (!data.parentId) {
      setError('Veuillez d\'abord vérifier le code OTP du parent.')
      studentForm.setError('parentId', { message: 'Vérification OTP requise.' })
      return
    }

    startSubmitting(async () => {
      try {
        setError(null)

        delete data.otp

        const payload = {
          ...data,
          birthDate: data.birthDate.toISOString(),
          avatarUrl,
          medicalCondition: data.medicalCondition,
        }

        const student = await createStudent(payload, data.parentId)
        onSuccess(student)
      }
      catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'élève')
      }
    })
  }

  const isLoading = isOtpChecking || isSubmitting

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

            <CollapsibleContent className="space-y-4">
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
            </CollapsibleContent>
          </Collapsible>
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
          label="Adresse"
        >
          {({ field }) => (
            <Input
              placeholder="Entrez l'adresse"
              {...field}
              value={field.value ?? ''}
              disabled={isLoading}
            />
          )}
        </FormFieldWrapper>

        {/* Display Parent Info - Keep specific structure */}
        {/* FormFieldWrapper is not ideal here as we don't have a standard input */}
        {/* We are just displaying info based on state and linking message to parentId */}
        <FormField
          control={studentForm.control}
          name="parentId"
          render={() => (
            <FormItem>
              {/* Manually place label/info */}
              <div className="text-center text-sm text-muted-foreground">
                {' '}
                {/* Mimic label style */}
                {isOtpChecking
                  ? 'Vérification OTP...'
                  : parentName
                    ? (
                        <p>
                          Le parent
                          {' '}
                          <span className="font-semibold underline underline-offset-2">{parentName}</span>
                          {' '}
                          a été trouvé.
                        </p>
                      )
                    : (
                        <p>Parent (Vérification OTP requise)</p>
                      )}
              </div>
              {/* Manually place message */}
              {/* RHF automatically links FormMessage via FormField context */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OTP Input Field using Wrapper */}
        <FormFieldWrapper
          control={studentForm.control}
          name="otp"
          label="Code Parent (OTP)"
          description="Code à 6 chiffres généré dans l'application parent."
          className="flex flex-col items-center justify-center"
        >
          {({ field }) => (
            <InputOTP
              maxLength={6}
              {...field}
              value={field.value ?? ''}
              disabled={isLoading}
              onComplete={verifyOTP}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        </FormFieldWrapper>

        {/* Medical condition using Wrapper */}
        <FormFieldWrapper
          control={studentForm.control}
          name="medicalCondition"
          label="Condition médicale (optionnel)"
        >
          {({ field }) => (
            <MedicalConditionInput
              value={field.value}
              onChange={field.onChange}
              // name={field.name} // Probably not needed if value/onChange are handled
              // onBlur={field.onBlur} // Pass if MedicalConditionInput uses it
              // ref={field.ref} // Pass if MedicalConditionInput needs ref
              disabled={isLoading}
            />
          )}
        </FormFieldWrapper>

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
            disabled={isLoading || !studentForm.formState.isValid || !parentName /* Also disable if parent not verified */}
          >
            {isSubmitting ? 'Création...' : 'Créer l\'élève'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
