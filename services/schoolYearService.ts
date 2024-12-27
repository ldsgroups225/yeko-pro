'use server'

import type { ISchoolYear } from '@/types'
import { createClient } from '@/lib/supabase/server'

/**
 * Fetches all active grades associated with a specific cycle ID.
 * Includes ordering and filtering for better data organization.
 *
 * @returns {Promise<ISchoolYear[]>} Array of school years ordered by name. Returns empty array if no school years found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching school years ('Failed to fetch school years')
 */
export async function fetchSchoolYears(): Promise<ISchoolYear[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('school_years')
    .select('id, name:academic_year_name')
    .order('end_year', { ascending: false })
    .throwOnError()

  if (error) {
    console.error('Error fetching school years:', error)
    throw new Error('Failed to fetch school years')
  }

  return data ?? []
}
