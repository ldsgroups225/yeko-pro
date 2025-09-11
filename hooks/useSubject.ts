import type { ISubject } from '@/types'
import { useCallback } from 'react'
import useSubjectStore from '@/store/subjectStore'

interface ReturnType {
  subjects: ISubject[]
  isLoading: boolean
  error: string | null
  hasNoSubjects: boolean
  loadSubjects: (schoolId: string) => Promise<void>
  getSubjectById: (subjectId: string) => ISubject | undefined
  clearSubjects: () => void
  selectedSubjectIds: string[]
  setSelectedSubjects: (ids: string[]) => void
  loadSchoolSubjects: (schoolId: string) => Promise<void>
  saveSelectedSubjects: (schoolId: string) => Promise<void>
  loadSchoolSubjectsForYear: (schoolId: string, schoolYearId: number) => Promise<void>
  saveSelectedSubjectsForYear: (schoolId: string, schoolYearId: number) => Promise<void>
  isSubjectSelected: (id: string) => boolean
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
 *   - selectedSubjectIds: Array of selected subject IDs
 *   - setSelectedSubjects: Function to set selected subject IDs
 *   - loadSchoolSubjects: Function to load selected subjects for a school
 *   - saveSelectedSubjects: Function to save selected subjects for a school
 *   - isSubjectSelected: Helper function to check if a subject is selected
 */
export function useSubject(): ReturnType {
  const {
    subjects,
    isLoading,
    error,
    fetchSubjects,
    getSubjectById,
    clearSubjects,
    setSelectedSubjects,
    loadSchoolSubjects,
    saveSelectedSubjects,
    loadSchoolSubjectsForYear,
    saveSelectedSubjectsForYear,
    selectedSubjectIds,
  } = useSubjectStore()

  /**
   * Checks if a specific subject is selected.
   *
   * @param {string} id - The ID of the subject to check.
   * @returns {boolean} True if the subject is selected.
   */
  const isSubjectSelected = useCallback((id: string): boolean => selectedSubjectIds.includes(id), [selectedSubjectIds])

  /**
   * Loads subjects for a specific cycle.
   * Wraps the store's fetchSubjects function with error handling.
   *
   * @param {string} schoolId - The ID of the school to load subjects for
   * @returns {Promise<void>}
   */
  const loadSubjectsStable = useCallback(async (schoolId: string): Promise<void> => {
    try {
      await fetchSubjects({ schoolId })
    }
    catch (error) {
      console.error('Failed to load subjects:', error)
      throw error
    }
  }, [fetchSubjects])

  /**
   * Stable versions of store functions
   */
  const loadSchoolSubjectsForYearStable = useCallback(loadSchoolSubjectsForYear, [loadSchoolSubjectsForYear])
  const saveSelectedSubjectsForYearStable = useCallback(saveSelectedSubjectsForYear, [saveSelectedSubjectsForYear])

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
    loadSubjects: loadSubjectsStable,
    getSubjectById,
    clearSubjects,
    setSelectedSubjects,
    loadSchoolSubjects,
    saveSelectedSubjects,
    loadSchoolSubjectsForYear: loadSchoolSubjectsForYearStable,
    saveSelectedSubjectsForYear: saveSelectedSubjectsForYearStable,
    selectedSubjectIds,
    isSubjectSelected,
  }
}
