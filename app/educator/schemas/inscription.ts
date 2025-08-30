// app/educator/schemas/inscription.ts

import { z } from 'zod'
import { MAX_STUDENT_AGE, maxBirthDate, MIN_STUDENT_AGE, minBirthDate } from '@/constants'

// Schema for searching existing students
export const studentSearchSchema = z.object({
  searchType: z.enum(['idNumber', 'name'], {
    required_error: 'Type de recherche requis',
  }),
  idNumber: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => {
  if (data.searchType === 'idNumber') {
    return data.idNumber && data.idNumber.trim().length > 0
  }
  if (data.searchType === 'name') {
    return data.firstName && data.firstName.trim().length > 0
      && data.lastName && data.lastName.trim().length > 0
  }
  return false
}, {
  message: 'Veuillez renseigner les champs requis pour le type de recherche sélectionné',
  path: ['searchType'],
})

// Schema for medical conditions
const medicalConditionSchema = z.object({
  description: z.string().min(1, 'Description requise'),
  severity: z.enum(['low', 'medium', 'high'], {
    required_error: 'Sévérité requise',
  }),
})

// Phone number validation (Côte d'Ivoire format)
const phoneSchema = z.string()
  .min(8, 'Numéro de téléphone invalide')
  .max(15, 'Numéro de téléphone invalide')
  .regex(/^[\d\s+\-()]+$/, 'Format de téléphone invalide')

// Main schema for new inscription
export const newInscriptionSchema = z.object({
  // Student Information
  studentFirstName: z.string({
    required_error: 'Le prénom de l\'élève est obligatoire',
  })
    .trim()
    .min(1, 'Le prénom de l\'élève est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),

  studentLastName: z.string({
    required_error: 'Le nom de l\'élève est obligatoire',
  })
    .trim()
    .min(1, 'Le nom de l\'élève est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  studentGender: z.enum(['M', 'F'], {
    required_error: 'Le genre de l\'élève est obligatoire',
  }),

  studentBirthDate: z.string({
    required_error: 'La date de naissance est obligatoire',
  })
    .refine((date) => {
      const birthDate = new Date(date)
      return birthDate >= minBirthDate && birthDate <= maxBirthDate
    }, {
      message: `L'âge doit être entre ${MIN_STUDENT_AGE} et ${MAX_STUDENT_AGE} ans`,
    }),

  studentAddress: z.string()
    .trim()
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional(),

  studentIdNumber: z.string()
    .trim()
    .min(6, 'Le matricule doit contenir au moins 6 caractères')
    .max(20, 'Le matricule ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),

  // Parent/Guardian Information
  parentPhone: z.string({
    required_error: 'Le numéro de téléphone du parent est obligatoire',
  })
    .trim()
    .min(8, 'Numéro de téléphone du parent invalide')
    .max(15, 'Numéro de téléphone du parent invalide')
    .regex(/^[\d\s+\-()]+$/, 'Format de téléphone invalide'),

  guardianFirstName: z.string({
    required_error: 'Le prénom du tuteur est obligatoire',
  })
    .trim()
    .min(1, 'Le prénom du tuteur est requis')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),

  guardianLastName: z.string({
    required_error: 'Le nom du tuteur est obligatoire',
  })
    .trim()
    .min(1, 'Le nom du tuteur est requis')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),

  guardianPhone: phoneSchema.refine((_phone) => {
    // Additional validation: should be different from parent phone if both provided
    return true // This will be validated in the form
  }, {
    message: 'Numéro de téléphone du tuteur requis',
  }),

  // Academic Information
  gradeId: z.number({
    required_error: 'Le niveau scolaire est obligatoire',
  })
    .positive('Veuillez sélectionner un niveau scolaire valide'),

  classId: z.string()
    .optional()
    .or(z.literal('')),

  // Special Status
  isGovernmentAffected: z.boolean().default(false),
  isOrphan: z.boolean().default(false),

  // Services
  isSubscribedToCanteen: z.boolean().default(false),
  isSubscribedToTransportation: z.boolean().default(false),

  // Medical Conditions (optional)
  medicalConditions: z.array(medicalConditionSchema).optional(),
})
  .refine((data) => {
    // Custom validation: Guardian phone should be different from parent phone
    if (data.parentPhone && data.guardianPhone) {
      return data.parentPhone !== data.guardianPhone
    }
    return true
  }, {
    message: 'Le numéro du tuteur doit être différent de celui du parent',
    path: ['guardianPhone'],
  })
  .refine((data) => {
    // Custom validation: If class is selected, grade must be selected
    if (data.classId && data.classId !== '') {
      return data.gradeId > 0
    }
    return true
  }, {
    message: 'Veuillez d\'abord sélectionner un niveau avant de choisir une classe',
    path: ['classId'],
  })

export type NewInscriptionFormData = z.infer<typeof newInscriptionSchema>
export type StudentSearchFormData = z.infer<typeof studentSearchSchema>

// Schema for inscription filters
export const inscriptionFilterSchema = z.object({
  searchTerm: z.string().optional(),
  gradeId: z.number().optional(),
  classId: z.string().optional(),
  enrollmentStatus: z.enum(['pending', 'accepted', 'rejected', 'waiting', 'active', 'inactive', 'suspended', 'graduated', 'transferred']).optional(),
  isGovernmentAffected: z.boolean().optional(),
  isOrphan: z.boolean().optional(),
  page: z.number().positive().default(1),
  limit: z.number().positive().default(10),
})

export type InscriptionFilterData = z.infer<typeof inscriptionFilterSchema>
