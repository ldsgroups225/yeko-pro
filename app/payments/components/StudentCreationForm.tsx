// app/payments/components/StudentCreationForm.tsx

import type { SubmitHandler } from 'react-hook-form'
import type { StudentCreationFormData } from '../schemas'
import type { IStudent } from '../types'
import { ImageUpload } from '@/components/ImageUpload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { maxBirthDate, minBirthDate } from '@/constants'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import fr from 'date-fns/locale/fr'
import { CalendarIcon } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { checkOTP, createStudent } from '../actions'
import { studentCreationSchema } from '../schemas'

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

  const studentForm = useForm<StudentCreationFormData>({
    resolver: zodResolver(studentCreationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: undefined,
      address: '',
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
      {/* Use react-hook-form's handleSubmit to trigger validation THEN onSubmit */}
      <form onSubmit={studentForm.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-center mb-6">
          <ImageUpload
            value={avatarUrl ?? null}
            onChange={url => setAvatarUrl(url ?? undefined)}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={studentForm.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le prénom" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={studentForm.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Entrez le nom" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={studentForm.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="flex space-x-4"
                  disabled={isLoading}
                >
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={studentForm.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de naissance</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
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
                  </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={studentForm.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input placeholder="Entrez l'adresse" {...field} value={field.value ?? ''} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display Parent Info */}
        <FormField
          control={studentForm.control}
          name="parentId"
          render={() => (
            <FormItem>
              <FormLabel className="text-center font-normal">
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
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* OTP Input Field */}
        <FormField
          control={studentForm.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center justify-center">
              <FormLabel>Code Parent (OTP)</FormLabel>
              <FormControl>
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
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground italic text-center mt-1">
                Code à 6 chiffres généré dans l'application parent.
              </FormDescription>
              {/* RHF message for OTP field */}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Display general error messages */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Display RHF server-side errors if you set them */}
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
