import type { Database } from '@/lib/supabase/types'
import { z } from 'zod'

type InstallmentTemplateRead = Database['public']['Tables']['installment_templates']['Row']
type InstallmentTemplateInsert = Database['public']['Tables']['installment_templates']['Insert']

const UUID = z.string().uuid()

/**
 * Zod schema for installment template validation
 * Enforces all constraints from the original SQL CREATE TABLE statement
 */
export const installmentTemplateSchema = z.object({
  id: UUID.optional(),
  schoolId: UUID.optional(),
  gradeId: z.number().int().positive(),
  installmentNumber: z.number().int().positive(),
  dueDate: z.date(),
  fixedAmount: z.number().nonnegative().nullable(),
  dayBeforeNotification: z.number().int().nonnegative().nullable(),
})

/**
 * Type inference for installment template
 * Derives the TypeScript type from the Zod schema
 */
export type InstallmentTemplate = z.infer<typeof installmentTemplateSchema>

/**
 * Serializes an installment template to match database insert requirements
 * Converts camelCase TypeScript types to snake_case database column names
 *
 * @param {Partial<InstallmentTemplate>} data - Partial installment template data
 * @returns {InstallmentTemplateInsert} Serialized data ready for database insertion
 * @throws {Error} If required fields are missing
 */
export function serializeInstallmentTemplate(data: Partial<InstallmentTemplate>): InstallmentTemplateInsert {
  return {
    grade_id: data.gradeId!,
    school_id: data.schoolId!,
    installment_number: data.installmentNumber!,
    due_date: new Date(data.dueDate!).toISOString(),
    fixed_amount: data.fixedAmount,
    day_before_notification: data.dayBeforeNotification,
  }
}

/**
 * Deserializes a database row to the application's type format
 * Converts snake_case database column names to camelCase TypeScript properties
 *
 * @param {InstallmentTemplateRead} data - Raw database row
 * @returns {InstallmentTemplate} Deserialized installment template
 */
export function deserializeInstallmentTemplate(data: InstallmentTemplateRead): InstallmentTemplate {
  return {
    id: data.id,
    gradeId: data.grade_id,
    schoolId: data.school_id,
    installmentNumber: data.installment_number,
    dueDate: new Date(data.due_date),
    fixedAmount: data.fixed_amount,
    dayBeforeNotification: data.day_before_notification,
  }
}
