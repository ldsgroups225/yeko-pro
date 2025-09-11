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
interface SubjectRow {
  id: string
  name: string
  gradeAndSeries?: Array<{
    gradeId: number
    seriesId: number | null
  }>
  [key: string]: unknown
}

export async function fetchSubjects(): Promise<ISubject[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')
    .throwOnError()

  if (error) {
    console.error('Error fetching subjects:', error)
    throw new Error('Failed to fetch subjects')
  }

  // Transform the data to match ISubject interface
  return (data as SubjectRow[] || []).map((subject): ISubject => ({
    id: subject.id,
    name: subject.name,
    gradeAndSeries: subject.gradeAndSeries || [],
  }))
}
