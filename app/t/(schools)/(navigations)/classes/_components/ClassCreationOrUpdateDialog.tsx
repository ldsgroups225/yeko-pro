import type { IGrade } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClasses, useUser } from '@/hooks'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeOptions: IGrade[]
  oldClass?: {
    id: string
    name: string
    gradeId: number
    maxStudent: number
  }
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Le nom de la classe doit contenir au moins 2 caractères.',
  }),
  gradeId: z.number({
    required_error: 'Veuillez sélectionner un niveau scolaire.',
  }).min(1, {
    message: 'Veuillez sélectionner un niveau scolaire.',
  }).max(13, {
    message: 'Veuillez sélectionner un niveau scolaire.',
  }),
  maxStudent: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number({
      required_error: 'Veuillez mentionner le nombre maximum d\'élève pour cette classe',
      invalid_type_error: 'Veuillez entrer un nombre valide',
    })
      .min(1, {
        message: 'Il faut au moins 1 élève par classe',
      })
      .max(75, {
        message: 'Il faut au maximum 75 élèves par classe',
      })
      .default(45),
  ),
})

export function ClassCreationOrUpdateDialog({
  open,
  onOpenChange,
  gradeOptions,
  oldClass,
}: Props) {
  const router = useRouter()

  const { user } = useUser()
  const { addClass, updateClass } = useClasses()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      gradeId: undefined,
      maxStudent: 45,
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = form

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user?.school) {
      toast.error('École non trouvée.')
      return
    }

    try {
      if (oldClass) {
        const updatedClass = await updateClass({
          classId: oldClass.id,
          name: data.name,
          gradeId: data.gradeId,
          maxStudent: data.maxStudent,
        })

        reset()

        // Redirect to the updated class's page
        router.replace(`/t/classes/${updatedClass.slug}`)
        toast.success('Classe modifiée avec succès!')
      }
      else {
        await addClass({
          name: data.name,
          schoolId: user?.school.id,
          gradeId: data.gradeId,
          maxStudent: data.maxStudent,
        })

        reset()
        onOpenChange(false)

        toast.success('Classe créée avec succès!')
      }
    }
    catch (error) {
      console.error(
        oldClass ? 'Error updating class' : 'Error creating class',
        error,
      )
      toast.error(
        oldClass
          ? 'Une erreur est survenue lors de la modification de la classe.'
          : 'Une erreur est survenue lors de la création de la classe.',
      )
    }
  }

  useEffect(() => {
    if (!open) {
      reset({
        name: '',
        gradeId: undefined,
        maxStudent: 45,
      })
    }
  }, [open, reset])

  useEffect(() => {
    if (oldClass) {
      reset({
        name: oldClass.name,
        gradeId: oldClass.gradeId,
        maxStudent: oldClass.maxStudent,
      })
    }
  }, [oldClass, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {oldClass ? 'Modifier la classe' : 'Créer une nouvelle classe'}
          </DialogTitle>
          <DialogDescription>
            Veuillez saisir le nom de la classe et sélectionner le niveau
            scolaire correspondant.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau Scolaire</FormLabel>
                  <Select
                    onValueChange={val => field.onChange(Number(val))}
                    value={field.value?.toString() ?? ''}
                    defaultValue={field.value?.toString() ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradeOptions.map(grade => (
                        <SelectItem key={grade.id} value={grade.id.toString()}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la classe</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 6ème 1, 2nde C4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxStudent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre maximum d'élève</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="75"
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  reset()
                }}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
