// app/inscriptions/schemas.ts

import { z } from 'zod'
import { MAX_STUDENT_AGE, maxBirthDate, MIN_STUDENT_AGE, minBirthDate } from '@/constants'

export const searchSchema = z.object({
  schoolCode: z.string().min(1, 'Le code de l\'école est requis'),
  studentId: z.string().min(1, 'La matricule de l\'élève est requise'),
})

// Schema for the second parent
const rawSecondParentSchema = z.object({
  fullName: z.string({
    required_error: 'Le nom complet du deuxième parent est requis',
  }).trim().optional(),
  gender: z.enum(['M', 'F'], {
    required_error: 'Le genre du deuxième parent est requis',
  }).optional(),
  phone: z.string({
    required_error: 'Le numéro de téléphone du deuxième parent est requis',
  }).trim().optional(),
  type: z.enum(['father', 'mother', 'guardian']).optional(),
})

// If every field is empty / undefined, we treat secondParent as undefined
const secondParentSchema = rawSecondParentSchema
  .transform((data) => {
    const { fullName = '', phone = '' } = data
    // consider empty if critical fields are blank
    if (fullName.trim() === '' && phone.trim() === '')
      return undefined
    return {
      fullName: fullName.trim(),
      phone: phone.trim(),
      gender: data.gender ?? 'M',
      type: data.type ?? 'guardian',
    }
  })
  .refine((val) => {
    // When provided, fullName, phone, gender and type must not be empty
    if (!val)
      return true // it's optional
    return val.fullName !== '' && val.phone !== '' && val.gender !== undefined && val.type !== undefined
  }, {
    message: 'Veuillez renseigner le nom complet, le téléphone, le genre et le type du deuxième parent ou bien laisser la section vide.',
  })
  .optional()

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
  idNumber: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '')
        return undefined
      return val
    },
    z.string()
      .trim()
      .min(8, 'Cette matricule n\'est pas correcte')
      .max(12, 'Cette matricule n\'est pas correcte'),
  ).optional(),
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
  parentPhone: z.string({ required_error: 'Numéro de téléphone du parent requis.' })
    .trim()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .max(15, 'Le numéro de téléphone est trop long'),
  // Second parent (optional)
  secondParent: secondParentSchema,
})

export type SearchFormData = z.infer<typeof searchSchema>
export type StudentCreationFormData = z.infer<typeof studentCreationSchema>
