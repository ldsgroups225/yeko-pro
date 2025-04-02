import { z } from 'zod'

export const searchSchema = z.object({
  schoolCode: z.string().min(1, 'Le code de l\'école est requis'),
  studentId: z.string().min(1, 'La matricule de l\'élève est requise'),
})

export const studentCreationSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  gender: z.enum(['M', 'F'], {
    required_error: 'Le genre est requis',
  }),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  address: z.string().optional(),
})

export type SearchFormData = z.infer<typeof searchSchema>
export type StudentCreationFormData = z.infer<typeof studentCreationSchema>
