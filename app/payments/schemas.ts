// app/payments/schemas.ts

import { z } from 'zod'
import { MAX_STUDENT_AGE, maxBirthDate, MIN_STUDENT_AGE, minBirthDate } from '@/constants'

export const searchSchema = z.object({
  schoolCode: z.string().min(1, 'Le code de l\'école est requis'),
  studentId: z.string().min(1, 'La matricule de l\'élève est requise'),
})

// Schema for the second parent
const secondParentSchema = z.object({
  fullName: z.string({
    required_error: 'Le nom complet du deuxième parent est requis',
  }).min(1, 'Le nom complet est requis'),
  gender: z.enum(['M', 'F'], {
    required_error: 'Le genre du deuxième parent est requis',
  }),
  phone: z.string({
    required_error: 'Le numéro de téléphone est requis',
  }).min(1, 'Le numéro de téléphone est requis'),
  type: z.enum(['father', 'mother', 'guardian'], {
    required_error: 'Le type de parent est requis',
    invalid_type_error: 'Type de parent invalide',
  }),
}).optional()

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
  idNumber: z.string()
    .trim()
    .min(8, 'Cette matricule n\'est pas correcte')
    .max(12, 'Cette matricule n\'est pas correcte')
    .optional(),
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
  // Second parent (optional)
  secondParent: secondParentSchema,
})

export type SearchFormData = z.infer<typeof searchSchema>
export type StudentCreationFormData = z.infer<typeof studentCreationSchema>
