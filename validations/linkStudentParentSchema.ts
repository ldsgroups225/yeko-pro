import { z } from 'zod'

export const linkStudentParentSchema = z.object({
  studentIdNumber: z.string({
    required_error: 'Il manque le numéro matricule de l\'élève',
    invalid_type_error: 'Le numéro matricule de l\'élève n\'est pas valide',
  }).length(9, 'La matricule de l\'élève doit contenir 9 caractères'),
  otp: z.string({
    required_error: 'Il manque le code OTP',
    invalid_type_error: 'Le code OTP n\'est pas valide',
  }).length(6, 'Le code OTP doit contenir 6 chiffres'),
})

export type LinkStudentParentData = z.infer<typeof linkStudentParentSchema>
