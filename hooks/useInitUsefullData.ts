import { fetchUserProfile } from '@/services'
import useUserStore from '@/store/userStore'
import { useGrade } from './useGrade'

/**
 * Hook to initialize reusable data: USER, SCHOOL, GRADES, SCHOOL YEARS.
 *
 * @throws {Error} If any of the required data fails to fetch.
 */
export function useInitUsefullData() {
  const { setUser } = useUserStore()
  const { loadGrades } = useGrade()

  /**
   * Initializes the user profile and related data.
   *
   * @returns {Promise<void>}
   */
  const initialize = async (): Promise<void> => {
    try {
      // 1. Fetch user profile
      const profile = await fetchUserProfile()
      if (!profile) {
        throw new Error('User profile not found')
      }

      // 2. Store user profile in Zustand store
      setUser(profile)

      // 3. Fetch grade list (add your logic here)
      await loadGrades(profile.school.cycleId)

      // 4. Fetch school years list (add your logic here)

      // 5. Store additional data in Zustand if needed
    }
    catch (error) {
      console.error('Error initializing useful data:', error)
      throw error
    }
  }

  return { initialize }
}
