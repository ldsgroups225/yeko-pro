import { useCallback } from 'react'

import { useGrade } from './useGrade'
import { useUser } from './useUser'

/**
 * Hook to initialize reusable data with memoization and better state management
 */
export function useInitUsefulData() {
  const { fetchUser, isAuthenticated } = useUser()
  const { loadGrades } = useGrade()

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
          loadGrades(user.school.cycleId),
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
  }, [fetchUser, isAuthenticated, loadGrades])

  return { initialize }
}
