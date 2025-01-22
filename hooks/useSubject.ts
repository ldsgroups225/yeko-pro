import type { ISubject } from '@/types'
import useSubjectStore from '@/store/subjectStore'

interface ReturnType {
  subjects: ISubject[]
  isLoading: boolean
  error: string | null
  hasNoSubjects: boolean
  loadSubjects: () => Promise<void>
  getSubjectById: (subjectId: string) => ISubject | undefined
  clearSubjects: () => void
}

/**
 * Custom hook to interact with the subject store.
 * Provides a simplified interface for subject-related operations and data access.
 *
 * @returns An object containing:
 *   - subjects: Array of all subjects
 *   - isLoading: Loading state for async operations
 *   - error: Error message if any operation failed
 *   - hasNoSubjects: Boolean indicating if subjects array is empty
 *   - loadSubjects: Function to fetch subjects for a cycle
 *   - getSubjectById: Function to get a specific subject
 *   - clearSubjects: Function to clear all subjects data
 */
export function useSubject(): ReturnType {
  const {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    getSubjectById,
    clearSubjects,
  } = useSubjectStore()

  /**
   * Loads subjects for a specific cycle.
   * Wraps the store's fetchSubjects function with error handling.
   *
   * @returns {Promise<void>}
   */
  const loadSubjects = async (): Promise<void> => {
    try {
      await fetchSubjects()
    }
    catch (error) {
      console.error('Failed to load subjects:', error)
      throw error
    }
  }

  /**
   * Checks if there are any subjects loaded.
   *
   * @returns {boolean} True if subjects array is empty
   */
  const hasNoSubjects = subjects.length === 0

  return {
    // Data
    subjects,
    isLoading,
    error,
    hasNoSubjects,

    // Actions
    loadSubjects,
    getSubjectById,
    clearSubjects,
  }
}
