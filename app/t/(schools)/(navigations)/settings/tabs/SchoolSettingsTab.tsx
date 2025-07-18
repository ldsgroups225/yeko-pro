'use client'

import type { ISchoolDTO } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, FileText, GraduationCap, LineChart, Loader2, Users } from 'lucide-react'
import { useActionState, useOptimistic, useRef, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { ImageUpload } from '@/components/ImageUpload'
import { PhoneInput } from '@/components/PhoneInput'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/hooks'
import { SchoolService } from '@/services/schoolService'
import SettingsSection from '../components/SettingsSection'

const formSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'établissement est requis'),
  email: z.string().email('Adresse email invalide'),
  city: z.string().min(1, 'La ville est requise').optional(),
  phone: z.string()
    .min(1, 'Le numéro de téléphone est requis')
    .regex(/^\+?[0-9\s-]+$/, 'Numéro de téléphone invalide')
    .optional(),
  code: z.string().min(1, 'Le code de l\'établissement est requis'),
  cycleId: z.string().min(1, 'Veuillez sélectionner un cycle'),
  address: z.string().min(1, 'La adresse est requise').nullish(),
  imageUrl: z.string().nullable(),
})

interface FormState {
  message: string
  success: boolean
}

function SchoolSettingsTab() {
  const { user } = useUser()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [state, submitAction, isPending] = useActionState<FormState, FormData>(
    async (prevState: FormState, formData: FormData) => {
      try {
        const data: Partial<ISchoolDTO> = {
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          city: formData.get('city') as string,
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
          imageUrl: formData.get('imageUrl') as string,
        }

        await SchoolService.updateSchool(user!.school.id, data)
        toast.success('Les données de l\'école ont été mises à jour avec succès !')

        return { message: 'Modifications enregistrées avec succès !', success: true }
      }
      catch (error) {
        return {
          message: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde',
          success: false,
        }
      }
    },
    { message: '', success: false },
  )

  const [_, setOptimisticState] = useOptimistic<FormState, FormState>(
    state,
    (currentState, newState) => ({
      ...currentState,
      ...newState,
      timestamp: Date.now(),
    }),
  )

  function formatPhone(phone: string): string {
    if (!phone.length)
      return '+225'

    if (phone.startsWith('+') || phone.startsWith('00')) {
      return phone.replaceAll(' ', '')
    }
    return `+225${phone.replaceAll(' ', '')}`
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.school?.name ?? '',
      email: user?.school?.email ?? '',
      city: user?.school?.city ?? '',
      phone: user?.school?.phone
        ? formatPhone(user?.school?.phone)
        : '',
      code: user?.school?.code ?? '',
      cycleId: user?.school?.cycleId ?? '',
      address: user?.school?.address ?? '',
      imageUrl: user?.school?.imageUrl ?? '',
    },
    mode: 'onChange',
  })

  const [isSaving, startTransition] = useTransition()

  const hasChanges
    = form.getValues('name') !== user?.school?.name
      || form.getValues('email') !== user?.school?.email
      || form.getValues('city') !== user?.school?.city
      || form.getValues('phone') !== user?.school?.phone
      || form.getValues('code') !== user?.school?.code
      || form.getValues('cycleId') !== user?.school?.cycleId
      || form.getValues('address') !== user?.school?.address
      || form.getValues('imageUrl') !== user?.school?.imageUrl

  const handleSubmit = () => {
    startTransition(async () => {
      setOptimisticState({ message: 'Sauvegarde en cours...', success: false })
      const isValid = await form.trigger()

      if (isValid) {
        buttonRef.current?.click()
      }
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Form {...form}>
        <form action={submitAction} className="space-y-6">
          <SettingsSection
            title="Informations de l'établissement"
            description="Gérez les informations principales de votre établissement"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isPending || isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Nom de l'établissement</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom de l'établissement"
                        {...field}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Code de l'établissement</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Code"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cycleId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Cycle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un cycle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="primary">Primaire</SelectItem>
                          <SelectItem value="secondary">Secondaire</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@ecole.ci"
                          {...field}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          {...field}
                          placeholder="27 27 27 2727"
                          ref={field.ref as any}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Paris"
                          {...field}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="12 rue des Ecoles"
                          {...field}
                          value={field.value ?? ''}
                          rows={2}
                        />
                      </FormControl>
                      {fieldState.error && (
                        <FormMessage>{fieldState.error.message}</FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </SettingsSection>

          <button ref={buttonRef} type="submit" className="hidden">
            Enregistrer les modifications
          </button>
        </form>
      </Form>

      <div className="space-y-6">
        <SettingsSection title="Statistiques" description="Aperçu des données de votre établissement">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Classes</span>
              </div>
              <p className="text-2xl font-bold">{user?.school?.classCount ?? 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Élèves</span>
              </div>
              <p className="text-2xl font-bold">{user?.school?.studentCount ?? 0}</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Actions rapides">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Configurer le calendrier scolaire</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2">
              <FileText className="h-4 w-4" />
              <span>Modèles de bulletins</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Rapports analytiques</span>
            </Button>
          </div>
        </SettingsSection>

        <div className="mt-6 space-y-2">
          <Button
            type="button"
            className="w-full md:w-auto"
            onClick={handleSubmit}
            disabled={isPending || isSaving || !hasChanges}
          >
            {isPending || isSaving
              ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sauvegarde...
                  </span>
                )
              : (
                  'Enregistrer les modifications'
                )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SchoolSettingsTab
