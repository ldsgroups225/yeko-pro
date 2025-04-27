// 'use client'

// import type { LessonProgressReport } from '@/services/progressReportService'
// import type { IGrade, ISchoolYear, ISubject } from '@/types'
// import { DatePicker } from '@/components/DatePicker' // Assuming you have this component
// import { Button } from '@/components/ui/button'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import { createLessonProgressReport, updateLessonProgressReport } from '@/services/progressReportService'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { Loader2 } from 'lucide-react'
// import { useTransition } from 'react'
// import { useForm } from 'react-hook-form'
// import { toast } from 'sonner'
// import { z } from 'zod'

// const reportSchema = z.object({
//   gradeId: z.number({ required_error: 'Niveau requis' }).int().positive(),
//   subjectId: z.string({ required_error: 'Matière requise' }).uuid('Matière invalide'),
//   schoolYearId: z.number({ required_error: 'Année scolaire requise' }).int().positive(),
//   lessonOrder: z.coerce.number({ required_error: 'Ordre requis' }).int().positive('Ordre doit être positif'),
//   lesson: z.string().min(3, 'Le nom de la leçon doit faire au moins 3 caractères'),
//   sessionsCount: z.coerce.number({ required_error: 'Nombre de séances requis' }).int().positive('Nombre de séances doit être positif'),
//   startedAt: z.date({ required_error: 'Date de début requise' }),
// })

// type ReportFormValues = z.infer<typeof reportSchema>

// // Fixed default values to avoid creating new references on each render
// const EMPTY_GRADES: IGrade[] = []
// const EMPTY_SUBJECTS: ISubject[] = []
// const EMPTY_SCHOOL_YEARS: ISchoolYear[] = []

// interface ProgressReportDialogProps {
//   isOpen: boolean
//   onClose: () => void
//   report?: LessonProgressReport & { grade?: { name: string }, subject?: { name: string } } // Optional for editing
//   grades?: IGrade[]
//   subjects?: ISubject[]
//   schoolYears?: ISchoolYear[]
// }

// export function ProgressReportDialog({
//   isOpen,
//   onClose,
//   report,
//   grades = EMPTY_GRADES,
//   subjects = EMPTY_SUBJECTS,
//   schoolYears = EMPTY_SCHOOL_YEARS,
// }: ProgressReportDialogProps) {
//   const [isPending, startFormTransition] = useTransition()
//   const isEditing = !!report

//   const form = useForm<ReportFormValues>({
//     resolver: zodResolver(reportSchema),
//     defaultValues: {
//       gradeId: report?.grade_id,
//       subjectId: report?.subject_id,
//       schoolYearId: report?.school_year_id,
//       lessonOrder: report?.lesson_order,
//       lesson: report?.lesson ?? '',
//       sessionsCount: report?.sessions_count,
//       startedAt: report?.started_at ? new Date(report.started_at) : new Date(),
//     },
//   })

//   const onSubmit = (values: ReportFormValues) => {
//     startFormTransition(async () => {
//       try {
//         const payload = {
//           grade_id: values.gradeId,
//           subject_id: values.subjectId,
//           school_year_id: values.schoolYearId,
//           lesson_order: values.lessonOrder,
//           lesson: values.lesson,
//           sessions_count: values.sessionsCount,
//           started_at: values.startedAt.toISOString(),
//         }

//         if (isEditing && report) {
//           await updateLessonProgressReport(report.id, payload)
//           toast.success('Rapport mis à jour avec succès.')
//         }
//         else {
//           await createLessonProgressReport(payload)
//           toast.success('Rapport créé avec succès.')
//         }
//         onClose()
//         form.reset() // Reset form after successful submission
//       }
//       catch (error) {
//         toast.error(error instanceof Error ? error.message : 'Une erreur est survenue.')
//       }
//     })
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[525px]">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? 'Modifier' : 'Ajouter'}
//             {' '}
//             un Suivi Pédagogique
//           </DialogTitle>
//           <DialogDescription>
//             Remplissez les détails de la progression de la leçon.
//           </DialogDescription>
//         </DialogHeader>
//         <Form {...form}>
//           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//             {/* School Year */}
//             <FormField
//               control={form.control}
//               name="schoolYearId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Année Scolaire</FormLabel>
//                   <Select
//                     onValueChange={value => field.onChange(Number(value))}
//                     value={field.value?.toString()}
//                     disabled={isEditing} // Often you don't change the year when editing
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choisir l'année scolaire" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {schoolYears.map(year => (
//                         <SelectItem key={year.id} value={year.id.toString()}>
//                           {year.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Grade */}
//             <FormField
//               control={form.control}
//               name="gradeId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Niveau</FormLabel>
//                   <Select
//                     onValueChange={value => field.onChange(Number(value))}
//                     value={field.value?.toString()}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choisir un niveau" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {grades.map(grade => (
//                         <SelectItem key={grade.id} value={grade.id.toString()}>
//                           {grade.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Subject */}
//             <FormField
//               control={form.control}
//               name="subjectId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Matière</FormLabel>
//                   <Select onValueChange={field.onChange} value={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Choisir une matière" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {subjects.map(subject => (
//                         <SelectItem key={subject.id} value={subject.id}>
//                           {subject.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Lesson Order */}
//             <FormField
//               control={form.control}
//               name="lessonOrder"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Ordre de la Leçon</FormLabel>
//                   <FormControl>
//                     <Input type="number" placeholder="Ex: 1" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Lesson Title */}
//             <FormField
//               control={form.control}
//               name="lesson"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Titre de la Leçon</FormLabel>
//                   <FormControl>
//                     <Input placeholder="Ex: Introduction à l'algèbre" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Sessions Count */}
//             <FormField
//               control={form.control}
//               name="sessionsCount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Nombre total de séances</FormLabel>
//                   <FormControl>
//                     <Input type="number" placeholder="Ex: 5" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Started At Date */}
//             <FormField
//               control={form.control}
//               name="startedAt"
//               render={({ field }) => (
//                 <FormItem className="flex flex-col">
//                   <FormLabel>Date de début prévue</FormLabel>
//                   <DatePicker date={field.value} onSelect={field.onChange} />
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <DialogFooter>
//               <Button type="button" variant="outline" onClick={onClose}>
//                 Annuler
//               </Button>
//               <Button type="submit" disabled={isPending}>
//                 {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                 {isEditing ? 'Mettre à jour' : 'Créer'}
//               </Button>
//             </DialogFooter>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }
