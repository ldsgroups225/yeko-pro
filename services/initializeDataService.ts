import type { IGrade, ISchoolYear, ISemester, ISubject, IUserProfileDTO } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ERole } from '@/types'

/**
 * Gets the current authenticated user's basic information.
 *
 * @returns {Promise<string | null>} The current user ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return user?.id ?? null
}

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

  if (error) {
    console.error('Error fetching grades:', error)
    throw new Error('Failed to fetch grades')
  }

  return data ?? []
}

/**
 * Fetches all active subjects associated with a specific cycle ID.
 * Includes ordering and filtering for better data organization.
 *
 * @returns {Promise<ISubject[]>} Array of subjects ordered by name. Returns empty array if no subjects found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching subjects ('Failed to fetch subjects')
 */
export async function fetchSubjects({ schoolId }: { schoolId: string }): Promise<ISubject[]> {
  const supabase = createClient()

  // Première requête pour obtenir les IDs des matières de l'école
  const { data: schoolSubjects, error: schoolSubjectsError } = await supabase
    .from('school_subjects')
    .select('subject_id')
    .eq('school_id', schoolId)
    // .eq('school_year_id', schoolYearId) // TODO: Activer quand nécessaire

  if (schoolSubjectsError) {
    console.error('Error fetching school subjects:', schoolSubjectsError)
    throw new Error('Failed to fetch school subjects')
  }

  if (!schoolSubjects || schoolSubjects.length === 0) {
    return []
  }

  // Extraction des IDs des matières
  const subjectIds = schoolSubjects.map(item => item.subject_id).filter((id): id is string => id !== null)

  // Deuxième requête pour obtenir les détails des matières
  const { data: subjects, error: subjectsError } = await supabase
    .from('subjects')
    .select('id, name')
    .in('id', subjectIds)
    .order('name')

  if (subjectsError) {
    console.error('Error fetching subjects:', subjectsError)
    throw new Error('Failed to fetch subjects')
  }

  // Mappage des données au format attendu
  return subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    gradeAndSeries: [], // Initialisé comme tableau vide, peut être rempli plus tard si nécessaire
  }))
}

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
    .select('id, academic_year_name, start_year, end_year, is_current')
    .order('end_year', { ascending: false })

  if (error) {
    console.error('Error fetching school years:', error)
    throw new Error('Failed to fetch school years')
  }

  // Map the data and create a proper name if academic_year_name is null
  return (data ?? []).map(item => ({
    id: item.id,
    name: item.academic_year_name || `${item.start_year}-${item.end_year}`,
    isCurrent: item.is_current,
  }))
}

/**
 * Fetches all active semesters associated with a specific school year ID.
 * Includes ordering and filtering for better data organization.
 *
 * @returns {Promise<ISemester[]>} Array of semesters ordered by start date. Returns empty array if no semesters found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching semesters ('Failed to fetch semesters')
 */
export async function fetchSemesters(schoolYearId: number): Promise<ISemester[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('semesters')
    .select('id, semester_name, start_date, end_date, is_current')
    .eq('school_year_id', schoolYearId)
    .order('start_date', { ascending: true })

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

/**
 * Fetches all subject IDs associated with a specific school for a given school year.
 * Returns an array of subject IDs for the given school and school year.
 *
 * @param {string} schoolId - The ID of the school to fetch subjects for
 * @param {number} schoolYearId - The ID of the school year to fetch subjects for
 * @returns {Promise<string[]>} Array of subject IDs. Returns empty array if no subjects found
 * @throws {Error} If user is not authenticated ('Unauthorized')
 * @throws {Error} If there's an error fetching school subjects ('Failed to fetch school subjects')
 */
export async function fetchSchoolSubjectIds(schoolId: string, schoolYearId: number): Promise<string[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('school_subjects')
    .select('subject_id')
    .eq('school_id', schoolId)
    .eq('school_year_id', schoolYearId)

  if (error) {
    console.error('Error fetching school subjects:', error)
    throw new Error('Failed to fetch school subjects')
  }

  return data?.map(item => item.subject_id) ?? []
}

/**
 * Saves the list of subject IDs for a specific school.
 * Uses a delete-then-insert approach to ensure data consistency.
 * Requires a current school year to be set in the database.
 *
 * @param {string} schoolId - The ID of the school to save subjects for
 * @param {string[]} subjectIds - Array of subject IDs to associate with the school
 * @returns {Promise<void>}
 * @throws {Error} If school ID is not provided ('School ID is required')
 * @throws {Error} If subject IDs array is not provided ('Subject IDs array is required')
 * @throws {Error} If no current school year is found ('No current school year found')
 * @throws {Error} If there's an error during the save operation ('Failed to save school subjects')
 */
export async function saveSchoolSubjects(schoolId: string, subjectIds: string[]): Promise<void> {
  const supabase = createClient()

  // First, get the current school year
  const { data: currentSchoolYear, error: schoolYearError } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (schoolYearError || !currentSchoolYear) {
    console.error('Error fetching current school year:', schoolYearError)
    throw new Error('No current school year found')
  }

  // Use a transaction-like approach: delete existing entries, then insert new ones
  try {
    // Delete existing school subjects for this school
    const { error: deleteError } = await supabase
      .from('school_subjects')
      .delete()
      .eq('school_id', schoolId)

    if (deleteError) {
      console.error('Error deleting existing school subjects:', deleteError)
      throw new Error('Failed to delete existing school subjects')
    }

    // Insert new school subjects if subjectIds is not empty
    if (subjectIds.length > 0) {
      const schoolSubjectsToInsert = subjectIds.map(subjectId => ({
        school_id: schoolId,
        school_year_id: currentSchoolYear.id,
        subject_id: subjectId,
      }))

      const { error: insertError } = await supabase
        .from('school_subjects')
        .insert(schoolSubjectsToInsert)

      if (insertError) {
        console.error('Error inserting school subjects:', insertError)
        throw new Error('Failed to insert school subjects')
      }
    }
  }
  catch (error) {
    console.error('Error saving school subjects:', error)
    throw new Error('Failed to save school subjects')
  }
}

/**
 * Saves the list of subject IDs for a specific school and school year.
 * Uses a delete-then-insert approach to ensure data consistency.
 *
 * @param {string} schoolId - The ID of the school to save subjects for
 * @param {number} schoolYearId - The ID of the school year
 * @param {string[]} subjectIds - Array of subject IDs to associate with the school
 * @returns {Promise<void>}
 * @throws {Error} If school ID is not provided ('School ID is required')
 * @throws {Error} If school year ID is not provided ('School Year ID is required')
 * @throws {Error} If subject IDs array is not provided ('Subject IDs array is required')
 * @throws {Error} If there's an error during the save operation ('Failed to save school subjects')
 */
export async function saveSchoolSubjectsForYear(schoolId: string, schoolYearId: number, subjectIds: string[]): Promise<void> {
  const supabase = createClient()

  // Use a transaction-like approach: delete existing entries, then insert new ones
  try {
    // Delete existing school subjects for this school and school year
    const { error: deleteError } = await supabase
      .from('school_subjects')
      .delete()
      .eq('school_id', schoolId)
      .eq('school_year_id', schoolYearId)

    if (deleteError) {
      console.error('Error deleting existing school subjects:', deleteError)
      throw new Error('Failed to delete existing school subjects')
    }

    // Insert new school subjects if subjectIds is not empty
    if (subjectIds.length > 0) {
      const schoolSubjectsToInsert = subjectIds.map(subjectId => ({
        school_id: schoolId,
        school_year_id: schoolYearId,
        subject_id: subjectId,
      }))

      const { error: insertError } = await supabase
        .from('school_subjects')
        .insert(schoolSubjectsToInsert)

      if (insertError) {
        console.error('Error inserting school subjects:', insertError)
        throw new Error('Failed to insert school subjects')
      }
    }
  }
  catch (error) {
    console.error('Error saving school subjects:', error)
    throw new Error('Failed to save school subjects')
  }
}

/**
 * Fetches the complete user profile including role information for any user type.
 * Now supports directors, teachers, and parents with role-based data loading.
 *
 * @returns {Promise<IUserProfileDTO>} The user's complete profile
 * @throws {Error} With message 'Unauthorized' if user is not authenticated
 * @throws {Error} With message 'Profile not found' if profile fetch fails
 */
export async function fetchUserProfileClientSide(): Promise<IUserProfileDTO> {
  try {
    const supabase = createClient()
    const userId = await getUserId()

    if (!userId) {
      throw new Error('Vous n\'êtes pas authentifié')
    }

    // Get user basic profile and ALL roles (removed DIRECTOR restriction)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, phone, avatar_url')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error('Profil non trouvé')
    }

    // Get user roles using the authorization service
    const { getUserRoles, getRoleDisplayName } = await import('./authorizationService')
    const roleInfo = await getUserRoles(userId)

    // Determine primary role and role string
    const primaryRole = roleInfo.primaryRole || ERole.PARENT // Default fallback
    const roleString = await getRoleDisplayName(primaryRole)

    // Build base user profile
    const baseProfile: IUserProfileDTO = {
      id: userId,
      email: profile.email!,
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      fullName: `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim(),
      phoneNumber: profile.phone ?? '',
      roleId: primaryRole,
      roleName: roleString,
      avatarUrl: profile.avatar_url || null,
      school: {
        id: '',
        name: '',
        code: '',
        city: '',
        phone: '',
        email: '',
        address: '',
        cycleId: '',
        imageUrl: '',
        classCount: 0,
        studentCount: 0,
        createdAt: '',
        createdBy: '',
        updatedAt: '',
        updatedBy: '',
      },
    }

    // Load role-specific data (only for directors with school access)
    const hasDirectorAccess = roleInfo.hasDirectorAccess
    const hasCashierAccess = roleInfo.hasCashierAccess
    const hasAccountantAccess = roleInfo.hasAccountantAccess
    const hasEducatorAccess = roleInfo.hasEducatorAccess
    const hasHeadmasterAccess = roleInfo.hasHeadmasterAccess

    const hasAccess = hasDirectorAccess || hasCashierAccess || hasAccountantAccess || hasEducatorAccess || hasHeadmasterAccess

    if (hasAccess && roleInfo.schoolId) {
      try {
        const [schoolResult, studentCountResult] = await Promise.all([
          supabase.from('schools')
            .select('*, classes(count)')
            .eq('id', roleInfo.schoolId)
            .single(),
          supabase.from('student_school_class')
            .select('*', { count: 'exact', head: true })
            .eq('school_id', roleInfo.schoolId)
            .eq('enrollment_status', 'accepted')
            .is('is_active', true),
        ])

        if (schoolResult.data) {
          baseProfile.school = {
            id: schoolResult.data.id,
            name: schoolResult.data.name,
            code: schoolResult.data.code,
            city: schoolResult.data.city ?? '',
            phone: schoolResult.data.phone ?? '',
            email: schoolResult.data.email ?? '',
            address: schoolResult.data.address ?? '',
            cycleId: schoolResult.data.cycle_id,
            imageUrl: schoolResult.data.image_url ?? '',
            classCount: (schoolResult.data.classes[0] as any)?.count ?? 0,
            studentCount: studentCountResult.count ?? 0,
            createdAt: schoolResult.data.created_at ?? '',
            createdBy: schoolResult.data.created_by ?? '',
            updatedAt: schoolResult.data.updated_at ?? '',
            updatedBy: schoolResult.data.updated_by ?? '',
          }
        }
      }
      catch {
        // Non-critical error - user profile still works without school data
        // console.warn('Failed to load school data:', error)
      }
    }

    return baseProfile
  }
  catch (error) {
    // Re-throw known errors with their original messages
    if (error instanceof Error && (error.message === 'Vous n\'êtes pas authentifié' || error.message === 'Profil non trouvé')) {
      throw error
    }

    // Handle unexpected errors
    throw new Error('Oups, une erreur s\'est produite')
  }
}
