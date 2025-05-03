import type { Database } from '@/lib/supabase/types'
import { z } from 'zod'

/**
 * Zod schema for TuitionSettings.
 * Defines the shape and validation rules for tuition settings data.
 */
const tuitionSettingsSchema = z.object({
  /**
   * Unique identifier for the tuition setting. UUID format. Optional when creating a new tuition setting.
   */
  id: z.string().uuid().optional(),
  /**
   * Unique identifier of the school to which these tuition settings apply. UUID format.
   */
  schoolId: z.string().uuid(),
  /**
   * Identifier of the grade level to which these tuition settings apply. Must be a positive integer.
   */
  gradeId: z.number().int().positive(),
  /**
   * The annual tuition fee for the grade. Must be a non-negative number.
   */
  annualFee: z.number().nonnegative(),
  /**
   * Government affected case applicable to the tuition fee. Must be a non-negative number.
   */
  governmentAnnualFee: z.number().nonnegative(),
  /**
   * Orphan discount amount applicable to the tuition fee. Must be a non-negative number.
   */
  orphanDiscountAmount: z.number().nonnegative(),
  /**
   * Canteen fee applicable to the tuition fee. Must be a non-negative number.
   */
  canteenFee: z.number().nonnegative(),
  /**
   * Transportation fee applicable to the tuition fee. Must be a non-negative number.
   */
  transportationFee: z.number().nonnegative(),
  /**
   * Timestamp indicating when the tuition setting was created. Automatically generated and in datetime format. Optional as it's set by the database.
   */
  createdAt: z.string().datetime().optional(),
  /**
   * Timestamp indicating when the tuition setting was last updated. Automatically updated and in datetime format. Optional as it's set by the database.
   */
  updatedAt: z.string().datetime().optional(),
})

/**
 * Type representing the structure of TuitionSettings, derived from the tuitionSettingsSchema.
 * Use this type to ensure type safety when working with tuition settings data in your application.
 */
export type TuitionSettings = z.infer<typeof tuitionSettingsSchema>

/**
 * Type representing a row from the 'tuition_settings' table as read from the database.
 */
type TuitionSettingsRead = Database['public']['Tables']['tuition_settings']['Row']
/**
 * Type representing data for inserting into the 'tuition_settings' table.
 */
type TuitionSettingsInsert = Database['public']['Tables']['tuition_settings']['Insert']

/**
 * Serializes a partial TuitionSettings object into a format suitable for insertion into the database.
 * It maps the application-level TuitionSettings structure to the database table columns.
 *
 * @param {Partial<TuitionSettings>} data - Partial tuition settings data. Only the properties intended for database insertion should be included.
 * @returns {TuitionSettingsInsert} Serialized tuition settings ready for database insertion.
 */
export function serializeTuition(data: Partial<TuitionSettings>): TuitionSettingsInsert {
  return {
    grade_id: data.gradeId!,
    school_id: data.schoolId!,
    annual_fee: data.annualFee!,
    government_annual_fee: data.governmentAnnualFee,
    orphan_discount_amount: data.orphanDiscountAmount,
    canteen_fee: data.canteenFee,
    transportation_fee: data.transportationFee,
  }
}

/**
 * Deserializes a TuitionSettingsRead object from the database into a TuitionSettings object.
 * It maps the database table columns back to the application-level TuitionSettings structure.
 *
 * @param {TuitionSettingsRead} data - Tuition settings data fetched from the database.
 * @returns {TuitionSettings} Deserialized tuition settings object, ready for use in the application.
 */
export function deserializeTuition(data: TuitionSettingsRead): TuitionSettings {
  return {
    id: data.id,
    gradeId: data.grade_id,
    schoolId: data.school_id,
    annualFee: data.annual_fee,
    governmentAnnualFee: data.government_annual_fee,
    orphanDiscountAmount: data.orphan_discount_amount,
    canteenFee: data.canteen_fee,
    transportationFee: data.transportation_fee,
    createdAt: data.created_at!,
    updatedAt: data.updated_at!,
  }
}

export { tuitionSettingsSchema }
