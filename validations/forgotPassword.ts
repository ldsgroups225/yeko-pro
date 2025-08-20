import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'L\'email est invalide' }),
})

export type IForgotPassword = z.infer<typeof forgotPasswordSchema>
