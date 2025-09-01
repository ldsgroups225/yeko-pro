// hooks/useInitUsefulData.ts

import { useCallback, useRef } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { fetchUserProfileClientSide } from '@/services/initializeDataService'
import useGradeStore from '@/store/gradeStore'
import useSchoolYearStore from '@/store/schoolYearStore'
import useSubjectStore from '@/store/subjectStore'
import useUserStore from '@/store/userStore'

export function useInitUsefulData() {
  // Select only the functions needed, which are stable references from Zustand
  const setUser = useUserStore(state => state.setUser)
  const fetchGrades = useGradeStore(state => state.fetchGrades)
  const fetchSubjects = useSubjectStore(state => state.fetchSubjects)
  const fetchSchoolYears = useSchoolYearStore(state => state.fetchSchoolYears)

  // Track if we've already initialized to prevent duplicate calls
  const initializationComplete = useRef(false)

  const initialize = useCallback(async (): Promise<void> => {
    if (initializationComplete.current) {
      // Already initialized, skip
      return
    }

    // Starting initialization

    try {
      // Fetch user profile first. fetchUser should handle not fetching if already loaded.
      const user = await fetchUserProfileClientSide()

      if (!user) {
        // No authenticated user found
        initializationComplete.current = true
        return
      }

      // User fetched successfully
      setUser(user)

      // Proceed only if user is successfully fetched and has necessary info
      if (user?.school?.cycleId) {
        // User has cycleId, fetching related data

        // Batch all store updates to prevent cascade re-renders
        await unstable_batchedUpdates(async () => {
          // Fetch other data in parallel
          await Promise.all([
            fetchSubjects(),
            fetchSchoolYears(),
            fetchGrades(user.school.cycleId),
          ])
        })

        // All data fetched successfully
      }
      else {
        // User has no school cycleId, skipping dependent data fetches
        // Potentially fetch other non-cycle-dependent data if needed
      }

      initializationComplete.current = true
    }
    catch (error) {
      console.error('useInitUsefulData: Initialization failed:', error)
      throw error
    }
  }, [])

  return { initialize }
}
