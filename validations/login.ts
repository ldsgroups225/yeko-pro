import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'L&apos;email est invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' }),
  rememberMe: z.boolean().default(false),
})

export type ILogin = z.infer<typeof loginSchema>
