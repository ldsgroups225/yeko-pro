import type { IGrade } from '@/types'
import useGradeStore from '@/store/gradeStore'

interface ReturnType {
  grades: IGrade[]
  isLoading: boolean
  error: string | null
  hasNoGrades: boolean
  loadGrades: (cycleId: string) => Promise<void>
  getGradeById: (gradeId: number) => IGrade | undefined
  clearGrades: () => void
}

/**
 * Custom hook to interact with the grade store.
 * Provides a simplified interface for grade-related operations and data access.
 *
 * @returns An object containing:
 *   - grades: Array of all grades
 *   - isLoading: Loading state for async operations
 *   - error: Error message if any operation failed
 *   - hasNoGrades: Boolean indicating if grades array is empty
 *   - loadGrades: Function to fetch grades for a cycle
 *   - getGradeById: Function to get a specific grade
 *   - clearGrades: Function to clear all grades data
 */
export function useGrade(): ReturnType {
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
