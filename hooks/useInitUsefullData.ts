// hooks/useInitUsefulData.ts

import useGradeStore from '@/store/gradeStore'
import useSchoolYearStore from '@/store/schoolYearStore'
import useSubjectStore from '@/store/subjectStore'
import useUserStore from '@/store/userStore'
import { useCallback } from 'react'

export function useInitUsefulData() {
  // Select only the functions needed, which are stable references from Zustand
  const fetchUser = useUserStore(state => state.fetchUser)
  const fetchGrades = useGradeStore(state => state.fetchGrades)
  const fetchSubjects = useSubjectStore(state => state.fetchSubjects)
  const fetchSchoolYears = useSchoolYearStore(state => state.fetchSchoolYears)
  // Get isAuthenticated status separately if needed for conditional logic *inside* initialize
  const isAuthenticated = useUserStore(state => state.isAuthenticated)

  const initialize = useCallback(async (): Promise<void> => {
    // console.log('Initialize function called. Authenticated:', isAuthenticated)

    // Fetch user profile first. fetchUser should handle not fetching if already loaded.
    // It might return null if not authenticated.
    const user = await fetchUser()

    // Proceed only if user is successfully fetched and has necessary info
    if (user?.school?.cycleId) {
      // console.log(`User ${user.id} fetched with cycleId ${user.school.cycleId}. Fetching related data...`)
      // Fetch other data in parallel
      await Promise.all([
        fetchSubjects(),
        fetchSchoolYears(),
        fetchGrades(user.school.cycleId),
      ])
      // console.log('Grades, Subjects, and School Years fetched.')
    }
    else if (user) {
      // console.warn(`User ${user.id} fetched, but no school cycleId found. Skipping dependent data fetches.`)
      // Potentially fetch other non-cycle-dependent data if needed
    }
    else {
      // console.log('No authenticated user found during initialization.')
      // No user, no further data fetching needed for this flow.
    }
  }, [isAuthenticated]) // Dependencies are stable Zustand actions

  return { initialize }
}
