import useGradeStore from '@/store/gradeStore'

/**
 * Custom hook to interact with the grade store.
 * Provides a simplified interface for grade-related operations and data access.
 *
 * @returns {object} Object containing grade-related functions and data
 * @returns {IGrade[]} .grades - Array of all grades
 * @returns {boolean} .isLoading - Loading state for async operations
 * @returns {string | null} .error - Error message if any operation failed
 * @returns {(cycleId: string) => Promise<void>} .loadGrades - Function to fetch grades for a cycle
 * @returns {(gradeId: string) => IGrade | undefined} .getGradeById - Function to get a specific grade
 * @returns {() => void} .clearGrades - Function to clear all grades data
 */
export function useGrade() {
  const {
    grades,
    isLoading,
    error,
    fetchGrades,
    getGradeById,
    clearGrades,
  } = useGradeStore()

  /**
   * Loads grades for a specific cycle.
   * Wraps the store's fetchGrades function with error handling.
   *
   * @param {string} cycleId - The ID of the cycle to fetch grades for
   * @returns {Promise<void>}
   */
  const loadGrades = async (cycleId: string): Promise<void> => {
    try {
      await fetchGrades(cycleId)
    }
    catch (error) {
      console.error('Failed to load grades:', error)
      throw error
    }
  }

  /**
   * Checks if there are any grades loaded.
   *
   * @returns {boolean} True if grades array is empty
   */
  const hasNoGrades = grades.length === 0

  return {
    // Data
    grades,
    isLoading,
    error,
    hasNoGrades,

    // Actions
    loadGrades,
    getGradeById,
    clearGrades,
  }
}
