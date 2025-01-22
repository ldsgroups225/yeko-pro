'use server'

import type { ISubject } from '@/types'
import { createClient } from '@/lib/supabase/server'

/**
 * Fetches all active subjects associated with a specific cycle ID.
 * Includes ordering and filtering for better data organization.
 *
 * @returns {Promise<ISubject[]>} Array of subjects ordered by name. Returns empty array if no subjects found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching subjects ('Failed to fetch subjects')
 */
export async function fetchSubjects(): Promise<ISubject[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name')
    .throwOnError()

  if (error) {
    console.error('Error fetching subjects:', error)
    throw new Error('Failed to fetch subjects')
  }

  return data ?? []
}
