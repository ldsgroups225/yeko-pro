import { z } from 'zod'

const tuitionSettingsSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  gradeId: z.number().int().positive(),
  annualFee: z.number().nonnegative(),
  stateDiscount: z.number().min(0).max(100),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export type TuitionSettings = z.infer<typeof tuitionSettingsSchema>

export { tuitionSettingsSchema }
