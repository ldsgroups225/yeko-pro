import type { IConductQueryParams, IConductStats, IConductStudent } from '@/types'
import { useCallback } from 'react'
import useConductStore from '@/store/conductStore'

interface ReturnType {
  // State
  classes: { id: string, name: string }[]
  students: IConductStudent[]
  stats: IConductStats | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  filters: IConductQueryParams

  // Actions
  fetchStudents: (params?: IConductQueryParams) => Promise<void>
  fetchStats: () => Promise<void>
  fetchClassesForFilter: () => Promise<void>
  setFilters: (filters: Partial<IConductQueryParams>) => void
  setCurrentPage: (page: number) => void
  clearData: () => void
  refreshData: () => Promise<void>

  // Computed values
  hasStudents: boolean
  hasNoStudents: boolean
  totalPages: number
}

/**
 * Custom hook for managing conduct data and operations.
 * Provides access to conduct students, statistics, and related actions.
 *
 * @returns {ReturnType} Object containing:
 *   - classes: Array of available classes of the school
 *   - students: Array of conduct student data
 *   - stats: Conduct statistics
 *   - isLoading: Loading state
 *   - error: Error message if any
 *   - totalCount: Total number of students
 *   - currentPage: Current page number
 *   - filters: Current filter parameters
 *   - fetchStudents: Function to fetch students with optional parameters
 *   - fetchStats: Function to fetch conduct statistics
 *   - setFilters: Function to update filter parameters
 *   - setCurrentPage: Function to update current page
 *   - clearData: Function to clear all data
 *   - refreshData: Function to refresh all data
 *   - hasStudents: Boolean indicating if students exist
 *   - hasNoStudents: Boolean indicating if no students exist
 *   - totalPages: Total number of pages for pagination
 */
export function useConduct(): ReturnType {
  const {
    classes,
    students,
    stats,
    isLoading,
    error,
    totalCount,
    currentPage,
    filters,
    fetchStudents,
    fetchStats,
    fetchClassesForFilter,
    setFilters,
    setCurrentPage,
    clearData,
    refreshData,
  } = useConductStore()

  /**
   * Stable version of fetchStudents with error handling
   */
  const fetchStudentsStable = useCallback(async (params?: IConductQueryParams): Promise<void> => {
    try {
      await fetchStudents(params)
    }
    catch (error) {
      console.error('Failed to fetch conduct students:', error)
      throw error
    }
  }, [fetchStudents])

  /**
   * Stable version of fetchStats with error handling
   */
  const fetchStatsStable = useCallback(async (): Promise<void> => {
    try {
      await fetchStats()
    }
    catch (error) {
      console.error('Failed to fetch conduct stats:', error)
      throw error
    }
  }, [fetchStats])

  /**
   * Stable version of refreshData with error handling
   */
  const refreshDataStable = useCallback(async (): Promise<void> => {
    try {
      await refreshData()
    }
    catch (error) {
      console.error('Failed to refresh conduct data:', error)
      throw error
    }
  }, [refreshData])

  /**
   * Checks if there are any students loaded
   */
  const hasStudents = students.length > 0

  /**
   * Checks if there are no students loaded
   */
  const hasNoStudents = students.length === 0 && !isLoading

  /**
   * Calculates total pages for pagination
   */
  const totalPages = Math.ceil(totalCount / (filters.limit || 12))

  return {
    // State
    classes,
    students,
    stats,
    isLoading,
    error,
    totalCount,
    currentPage,
    filters,

    // Actions
    fetchStudents: fetchStudentsStable,
    fetchStats: fetchStatsStable,
    fetchClassesForFilter,
    setFilters,
    setCurrentPage,
    clearData,
    refreshData: refreshDataStable,

    // Computed values
    hasStudents,
    hasNoStudents,
    totalPages,
  }
}
