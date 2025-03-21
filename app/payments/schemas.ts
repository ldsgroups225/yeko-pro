import { z } from 'zod'

export const searchSchema = z.object({
  studentId: z.string().min(1, 'Le numéro de matricule est requis'),
  schoolCode: z.string().min(1, 'Le code de l\'école est requis'),
})

export type SearchFormData = z.infer<typeof searchSchema>
