'use server'

import type { ISchoolYear, ISemester } from '@/types'
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
  const supabase = await createClient()

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

export async function fetchSemesters(schoolYearId: number): Promise<ISemester[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('semesters')
    .select('id, semester_name, start_date, end_date, is_current')
    .eq('school_year_id', schoolYearId)
    .order('start_date', { ascending: true })
    .throwOnError()

  if (error) {
    console.error('Error fetching semesters:', error)
    throw new Error('Failed to fetch semesters')
  }

  return data.map(semester => ({
    id: semester.id,
    name: semester.semester_name,
    startDate: semester.start_date,
    endDate: semester.end_date,
    isCurrent: semester.is_current,
  })) ?? []
}
