// app/payments/schemas.ts

import { MAX_STUDENT_AGE, maxBirthDate, MIN_STUDENT_AGE, minBirthDate } from '@/constants'
import { z } from 'zod'

export const searchSchema = z.object({
  schoolCode: z.string().min(1, 'Le code de l\'école est requis'),
  studentId: z.string().min(1, 'La matricule de l\'élève est requise'),
})

export const studentCreationSchema = z.object({
  firstName: z.string({
    required_error: 'Le prénom est obligatoire',
  })
    .trim()
    .min(1, 'Le prénom est requis'),
  lastName: z.string({
    required_error: 'Le nom est obligatoire',
  })
    .trim()
    .min(1, 'Le nom est requis'),
  gender: z.enum(['M', 'F'], {
    required_error: 'Le genre est obligatoire',
  }),
  birthDate: z.coerce.date({
    required_error: 'Date de naissance obligatoire.',
    invalid_type_error: 'Date invalide.',
  })
    .min(minBirthDate, { message: `Trop jeune (minimum ${MIN_STUDENT_AGE} ans).` })
    .max(maxBirthDate, { message: `Trop âgé (maximum ${MAX_STUDENT_AGE} ans).` }),
  address: z.string().trim().optional(),
  medicalCondition: z.array(z.object({
    id: z.string().optional(),
    description: z.string(),
    severity: z.enum(['low', 'medium', 'high']),
  })),
  parentId: z.string({ required_error: 'Vérification parent requise.' })
    .min(1, 'Vérification parent requise.'),
  otp: z.string({ required_error: 'Code OTP requis.' })
    .regex(/^\d{6}$/, 'Code OTP : 6 chiffres requis.')
    .optional(),
})

export type SearchFormData = z.infer<typeof searchSchema>
export type StudentCreationFormData = z.infer<typeof studentCreationSchema>
