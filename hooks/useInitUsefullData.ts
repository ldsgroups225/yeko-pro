import useGradeStore from '@/store/gradeStore'
import useSchoolYearStore from '@/store/schoolYearStore'
import useSubjectStore from '@/store/subjectStore'
import useUserStore from '@/store/userStore'
import { useCallback } from 'react'

/**
 * Hook to initialize reusable data with memoization and better state management
 */
export function useInitUsefulData() {
  const { fetchGrades } = useGradeStore()
  const { fetchSubjects } = useSubjectStore()
  const { fetchSchoolYears } = useSchoolYearStore()
  const { fetchUser, isAuthenticated } = useUserStore()

  // Memoize the initialize function to prevent unnecessary recreations
  const initialize = useCallback(async (): Promise<void> => {
    try {
      // Prevent duplicate initialization if already authenticated
      if (isAuthenticated) {
        return
      }

      // 1. Fetch user profile
      const user = await fetchUser()

      // 2. Only proceed with additional data loading if we have a valid user
      if (user?.school?.cycleId) {
        // Load grades in parallel with other potential data fetching
        await Promise.all([
          fetchSubjects(),
          fetchSchoolYears(),
          fetchGrades(user.school.cycleId),
          // Add other parallel loading operations here
        ])
      }
      else {
        throw new Error('Invalid user data: missing school or cycle information')
      }
    }
    catch (error) {
      console.error('Error initializing useful data:', error)
      throw error
    }
  }, [])

  return { initialize }
}
