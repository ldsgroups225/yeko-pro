import { MIN_STUDENT_AGE } from '@/constants'
import { subYears } from 'date-fns'
import z from 'zod'

export const studentFormSchema = z.object({
  id: z.string(),
  idNumber: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  gender: z.enum(['M', 'F'], { required_error: 'Veuillez sélectionner le genre' }).nullable(),
  classId: z.string().optional(),
  class: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  dateOfBirth: z.date({
    required_error: 'Veuillez sélectionner une date',
    invalid_type_error: 'Format de date invalide',
  })
    .max(subYears(new Date(), MIN_STUDENT_AGE), 'L\'élève doit avoir au moins 11 ans')
    .nullable(),
  avatarUrl: z.string().nullable(),
  address: z.string().optional().nullable(),
})

export type StudentFormValues = z.infer<typeof studentFormSchema>
