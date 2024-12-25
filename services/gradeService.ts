'use server'

import type { IGrade } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { getUserId } from './userService'

/**
 * Fetches all active grades associated with a specific cycle ID.
 * Includes ordering and filtering for better data organization.
 *
 * @param {string} cycleId - The ID of the cycle to fetch grades for
 * @returns {Promise<IGrade[]>} Array of grades ordered by name. Returns empty array if no grades found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching grades ('Failed to fetch grades')
 */
export async function fetchGrades(cycleId: string): Promise<IGrade[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('grades')
    .select(`
      id,
      name
    `)
    .eq('cycle_id', cycleId)
    .order('id', { ascending: true })
    .throwOnError()

  console.log('==========> data', data?.length)

  if (error) {
    console.error('Error fetching grades:', error)
    throw new Error('Failed to fetch grades')
  }

  return data ?? []
}
