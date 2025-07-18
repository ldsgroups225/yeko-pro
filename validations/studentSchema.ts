import { subYears } from 'date-fns'
import z from 'zod'
import { MIN_STUDENT_AGE } from '@/constants'

// Schema for second parent fields
const secondParentSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet du deuxième parent est requis'),
  gender: z.enum(['M', 'F'], { required_error: 'Veuillez sélectionner le genre' }),
  phone: z.string().min(8, 'Le numéro de téléphone doit contenir au moins 8 chiffres'),
  type: z.enum(['father', 'mother', 'guardian'], {
    required_error: 'Veuillez sélectionner le type de parent',
  }),
}).partial().refine(
  (data) => {
    // If any field is filled, all are required
    const hasAnyField = Object.values(data).some(value => value !== undefined)
    if (!hasAnyField)
      return true // All fields are optional if none are filled
    return data.fullName && data.gender && data.phone && data.type
  },
  {
    message: 'Tous les champs du deuxième parent doivent être remplis',
    path: ['secondParent'],
  },
)

export const studentFormSchema = z.object({
  id: z.string(),
  idNumber: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom de famille doit contenir au moins 2 caractères'),
  gender: z.enum(['M', 'F'], { required_error: 'Veuillez sélectionner le genre' }).nullable(),
  classes: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  gradeName: z.string().optional(),
  classId: z.string().optional(),
  dateOfBirth: z.date({
    required_error: 'Veuillez sélectionner une date',
    invalid_type_error: 'Format de date invalide',
  })
    .max(subYears(new Date(), MIN_STUDENT_AGE), 'L\'élève doit avoir au moins 11 ans')
    .nullable(),
  avatarUrl: z.string().nullable(),
  address: z.string().optional().nullable(),
  secondParent: secondParentSchema.optional().nullable(),
})

export type StudentFormValues = z.infer<typeof studentFormSchema>
