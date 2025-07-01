import type { ISchoolYear, ISemester } from '@/types'
import useSchoolYearStore from '@/store/schoolYearStore'

interface ReturnType {
  isLoading: boolean
  error: string | null
  hasNoSchoolYears: boolean
  schoolYears: ISchoolYear[]
  semesters: ISemester[]
  selectedSchoolYearId: number
  clearSchoolYears: () => void
  activeSemester: ISemester | null
  loadSchoolYears: () => Promise<void>
  fetchSemesters: (schoolYearId: number) => Promise<void>
  setSelectedSchoolYearId: (schoolYearId: number) => void
  getSchoolYearById: (schoolYearId: number) => ISchoolYear | undefined
}

/**
 * Custom hook to interact with the school year store.
 * Provides a simplified interface for school year-related operations and data access.
 *
 * @returns An object containing:
 *   - schoolYears: Array of all school years
 *   - isLoading: Loading state for async operations
 *   - error: Error message if any operation failed
 *   - hasNoGrades: Boolean indicating if grades array is empty
 *   - loadGrades: Function to fetch grades for a cycle
 *   - getGradeById: Function to get a specific grade
 *   - clearGrades: Function to clear all grades data
 */
export function useSchoolYear(): ReturnType {
  const {
    error,
    isLoading,
    semesters,
    schoolYears,
    fetchSemesters,
    activeSemester,
    clearSchoolYears,
    fetchSchoolYears,
    getSchoolYearById,
    selectedSchoolYearId,
    setSelectedSchoolYearId,
  } = useSchoolYearStore()

  /**
   * Loads grades for a specific cycle.
   * Wraps the store's fetchGrades function with error handling.
   *
   * @returns {Promise<void>}
   */
  const loadSchoolYears = async (): Promise<void> => {
    try {
      await fetchSchoolYears()
    }
    catch (error) {
      console.error('Failed to load school years:', error)
      throw error
    }
  }

  /**
   * Checks if there are any school years loaded.
   *
   * @returns {boolean} True if school years array is empty
   */
  const hasNoSchoolYears = schoolYears.length === 0

  return {
    // Data
    error,
    isLoading,
    semesters,
    schoolYears,
    activeSemester,
    hasNoSchoolYears,
    selectedSchoolYearId,

    // Actions
    fetchSemesters,
    loadSchoolYears,
    clearSchoolYears,
    getSchoolYearById,
    setSelectedSchoolYearId,
  }
}
