import type { StudentCreationFormData } from '../schemas'
import type { IStudent } from '../types'
import { ImageUpload } from '@/components/ImageUpload'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createStudent } from '../actions'
import { studentCreationSchema } from '../schemas'

const otpSchema = z.object({
  otp: z.string().min(6, 'Le code OTP doit contenir au moins 6 caractères'),
})

type OTPFormData = z.infer<typeof otpSchema>

interface StudentCreationFormProps {
  schoolId: string
  onSuccess: (student: IStudent) => void
  onCancel: () => void
}

export function StudentCreationForm({
  schoolId,
  onSuccess,
  onCancel,
}: StudentCreationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()
  const [parentId, setParentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form for OTP verification
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  })

  // Form for student creation
  const studentForm = useForm<StudentCreationFormData>({
    resolver: zodResolver(studentCreationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'M',
      birthDate: '',
      address: '',
    },
  })

  const verifyOTP = async (data: OTPFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // Call API to verify OTP and get parent ID
      const response = await fetch('/api/verify-parent-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: data.otp }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur de vérification OTP')
      }

      const { parentId: verifiedParentId } = await response.json()
      setParentId(verifiedParentId)
    }
    catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de vérification OTP')
    }
    finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: StudentCreationFormData) => {
    if (!parentId) {
      setError('Veuillez d\'abord vérifier le code OTP du parent')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const student = await createStudent({ ...data, avatarUrl }, schoolId, parentId)
      onSuccess(student)
    }
    catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de l\'élève')
    }
    finally {
      setIsLoading(false)
    }
  }

  // If parent is not verified yet, show OTP verification form
  if (!parentId) {
    return (
      <Form {...otpForm}>
        <form onSubmit={otpForm.handleSubmit(verifyOTP)} className="space-y-4">
          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code OTP du parent</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Entrez le code OTP généré par l'application mobile"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="text-sm text-muted-foreground">
            <p>Le parent doit:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Se connecter à l'application mobile Yeko</li>
              <li>Générer un code OTP depuis son profil</li>
              <li>Vous fournir ce code pour lier l'élève à son compte</li>
            </ol>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Vérification...' : 'Vérifier'}
            </Button>
          </div>
        </form>
      </Form>
    )
  }

  // Once parent is verified, show student creation form
  return (
    <Form {...studentForm}>
      <form onSubmit={studentForm.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input placeholder="Entrez le prénom" {...field} />
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
                  <Input placeholder="Entrez le nom" {...field} />
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
            <FormItem>
              <FormLabel>Genre</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex space-x-4"
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
            <FormItem>
              <FormLabel>Date de naissance</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
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
                <Input placeholder="Entrez l'adresse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
