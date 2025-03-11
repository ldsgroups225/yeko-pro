// app/t/(schools)/(navigations)/teachers/_components/AssignClassesDialog.tsx

'use client'

import type { ITeacherDTO } from '@/types'

import { Combobox } from '@/components/Combobox'
import { Button } from '@/components/ui/button'
import {
  DialogContent,
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
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

import { useClassesData } from '@/hooks/useClassesData'
import { useSubject } from '@/hooks/useSubject'
import { updateTeacherAssignments } from '@/services/teacherService'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import { startTransition, useActionState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  assignments: z.array(z.object({
    classId: z.string().min(1, 'Veuillez sélectionner une classe'),
    subjectId: z.string().min(1, 'Veuillez sélectionner une matière'),
    isMainTeacher: z.boolean().default(false),
  })),
})

type FormValues = z.infer<typeof formSchema>

interface AssignClassesDialogProps {
  teacherId: string
  teacherName: string
  currentAssignments: NonNullable<ITeacherDTO['assignments']>
  onClose: () => void
}

type ActionState = {
  success?: boolean
  error?: string
} | null

export function AssignClassesDialog({
  teacherId,
  teacherName,
  currentAssignments,
  onClose,
}: AssignClassesDialogProps) {
  const { results: classes } = useClassesData({
    initialItemsPerPage: 100,
    filters: {},
  })
  const { subjects } = useSubject()
  const { toast } = useToast()
  const router = useRouter()
  const hasShownSuccess = useRef(false)

  const [state, submitAction, isPending] = useActionState<ActionState, FormValues>(
    async (_prevState: ActionState, formData: FormValues) => {
      try {
        await updateTeacherAssignments(teacherId, formData.assignments)
        return { success: true }
      }
      catch {
        return { error: 'Une erreur est survenue lors de la mise à jour des classes' }
      }
    },
    null,
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assignments: currentAssignments.map(assignment => ({
        classId: assignment.classId,
        subjectId: assignment.subjectId,
        isMainTeacher: assignment.isMainTeacher,
      })),
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    hasShownSuccess.current = false
    startTransition(() => {
      submitAction(values)
    })
  })

  // Gérer les erreurs et le succès avec useEffect
  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Erreur',
        description: state.error,
        variant: 'destructive',
      })
    }

    if (state?.success && !hasShownSuccess.current) {
      hasShownSuccess.current = true
      toast({
        title: 'Succès',
        description: 'Les classes ont été mises à jour avec succès',
        variant: 'default',
      })
      router.refresh()
      onClose()
    }
  }, [state, toast, router, onClose])

  // Nettoyer l'état du succès quand le composant est démonté
  useEffect(() => {
    return () => {
      hasShownSuccess.current = false
    }
  }, [])

  return (
    <DialogContent className="sm:max-w-[625px] h-[80vh] flex flex-col">
      <DialogHeader className="sticky top-0 bg-background z-10 pb-4 -mx-6 px-6 border-b">
        <DialogTitle className="truncate">
          Assigner des classes à
          {' '}
          {teacherName}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col h-full">
          <div className="divide-y overflow-y-auto flex-1 px-6 -mx-6">
            {form.watch('assignments').map((_, index) => (
              <div key={nanoid()} className="grid grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_80px_40px] items-end gap-4 py-4">
                <FormField
                  control={form.control}
                  name={`assignments.${index}.classId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classe</FormLabel>
                      <FormControl>
                        <Combobox
                          value={field.value}
                          onSelect={option => field.onChange(option.id)}
                          options={classes.map(c => ({
                            id: c.id,
                            name: c.name,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`assignments.${index}.subjectId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matière</FormLabel>
                      <FormControl>
                        <Combobox
                          value={field.value}
                          onSelect={option => field.onChange(option.id)}
                          options={subjects.map(s => ({
                            id: s.id,
                            name: s.name,
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`assignments.${index}.isMainTeacher`}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-end gap-2">
                      <FormLabel>PP</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const assignments = [...form.getValues('assignments')]
                    assignments.splice(index, 1)
                    form.setValue('assignments', assignments)
                  }}
                  className="self-end"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="bg-background py-4 border-t flex items-center justify-between mt-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const assignments = form.getValues('assignments')
                form.setValue('assignments', [
                  ...assignments,
                  { classId: '', subjectId: '', isMainTeacher: false },
                ])
              }}
            >
              Ajouter une classe
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  onClose()
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  )
}
