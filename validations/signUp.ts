import { z } from 'zod'

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Le nom complet doit contenir au moins 2 caractères' })
    .max(50, { message: 'Le nom complet ne peut pas dépasser 50 caractères' })
    .regex(/^[a-zA-Z\u00C0-\u00FF\u0100-\u017F\u0180-\u024F\s'-]+$/, { message: 'Le nom complet ne peut contenir que des lettres, espaces, apostrophes et tirets' })
    .trim(),
  email: z.string().email({ message: 'L\'email est invalide' }),
  password: z
    .string()
    .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    .regex(/[a-z]/i, { message: 'Le mot de passe doit contenir au moins une lettre' })
    .regex(/\d/, { message: 'Le mot de passe doit contenir au moins un chiffre' })
    .regex(/[^a-z0-9]/i, { message: 'Le mot de passe doit contenir au moins un caractère spécial' }),
})

export type ISignUp = z.infer<typeof signUpSchema>
