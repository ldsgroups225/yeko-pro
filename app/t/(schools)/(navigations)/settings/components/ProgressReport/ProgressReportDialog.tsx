'use client'

import type { IGrade, ILessonProgressReportConfig, ISubject } from '@/types'
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
import {
  createLessonProgressReportConfig,
  updateLessonProgressReportConfig,
} from '@/services/progressReportService'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Define allowed series values
const seriesEnum = z.enum(['A', 'C', 'D']).nullable()

enum Series {
  A = 'A',
  C = 'C',
  D = 'D',
}

type SERIES = Series | null

// Zod schema with conditional requirement for series when gradeId > 10
const reportSchema = z
  .object({
    gradeId: z.number({ required_error: 'Niveau requis' }).int().positive(),
    series: seriesEnum,
    subjectId: z.string({ required_error: 'Matière requise' }).uuid('Matière invalide'),
    schoolYearId: z.number({ required_error: 'Année scolaire requise' }).int().positive(),
    lessonOrder: z.coerce.number({ required_error: 'Ordre requis' }).int().positive('Ordre doit être positif'),
    lesson: z.string().min(3, 'Le nom de la leçon doit faire au moins 3 caractères'),
    sessionsCount: z.coerce
      .number({ required_error: 'Nombre de séances requis' })
      .int()
      .positive('Nombre de séances doit être positif'),
  })
  .superRefine((vals, ctx) => {
    if (vals.gradeId > 10 && !vals.series) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['series'],
        message: 'Série requise pour ce niveau',
      })
    }
  })

type ReportFormValues = z.infer<typeof reportSchema>

type CreatePayload = Parameters<typeof createLessonProgressReportConfig>[0]
type UpdatePayload = Parameters<typeof updateLessonProgressReportConfig>[1]

const EMPTY_GRADES: IGrade[] = []
const EMPTY_SUBJECTS: ISubject[] = []

interface ProgressReportDialogProps {
  isOpen: boolean
  onClose: () => void
  report?: ILessonProgressReportConfig
  grades?: IGrade[]
  subjects?: ISubject[]
  schoolYearId: number
  refresh: () => Promise<void>
}

export function ProgressReportDialog({
  isOpen,
  onClose,
  report,
  grades = EMPTY_GRADES,
  subjects = EMPTY_SUBJECTS,
  schoolYearId,
  refresh,
}: ProgressReportDialogProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(report)

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      gradeId: report?.gradeId,
      series: (report?.series as SERIES) ?? null,
      subjectId: report?.subjectId,
      schoolYearId: report?.schoolYearId ?? schoolYearId,
      lessonOrder: report?.lessonOrder,
      lesson: report?.lesson ?? '',
      sessionsCount: report?.sessionsCount,
    },
  })

  // Watch gradeId to conditionally render series field
  const gradeIdValue = form.watch('gradeId')

  const onSubmit = (values: ReportFormValues) => {
    startTransition(async () => {
      try {
        const { gradeId, series, subjectId, schoolYearId, lessonOrder, lesson, sessionsCount } = values
        const payload: CreatePayload & Partial<Pick<UpdatePayload, 'series'>> = {
          grade_id: gradeId,
          subject_id: subjectId,
          school_year_id: schoolYearId,
          lesson_order: lessonOrder,
          lesson,
          sessions_count: sessionsCount,
          ...(series != null ? { series } : {}),
        }

        if (isEditing && report) {
          await updateLessonProgressReportConfig(report.id, payload)
          toast.success('Rapport mis à jour avec succès.')
        }
        else {
          await createLessonProgressReportConfig(payload)
          toast.success('Rapport créé avec succès.')
        }

        await refresh()
        onClose()
        form.reset()
      }
      catch (error) {
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue.')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier' : 'Ajouter'}
            {' '}
            un Suivi Pédagogique
          </DialogTitle>
          <DialogDescription>Remplissez les détails de la progression de la leçon.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Grade */}
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Niveau</FormLabel>
                  <Select onValueChange={v => field.onChange(Number(v))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un niveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades.map(g => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Series (conditionally rendered) */}
            <AnimatePresence initial={false}>
              {gradeIdValue > 10 && (
                <motion.div
                  key="series-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FormField
                    control={form.control}
                    name="series"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Série</FormLabel>
                        <Select onValueChange={v => field.onChange(v as SERIES)} value={field.value ?? undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choisir une série" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(Series).map(s => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject */}
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Matière</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une matière" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lesson Order */}
            <FormField
              control={form.control}
              name="lessonOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre de la Leçon</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lesson Title */}
            <FormField
              control={form.control}
              name="lesson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la Leçon</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Introduction à l'algèbre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sessions Count */}
            <FormField
              control={form.control}
              name="sessionsCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre total de séances</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ex: 5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isEditing ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
