import type { IClass } from '@/types'
import useClassStore from '@/store/classStore'

interface UseClassesResult {
  classes: IClass[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  itemsPerPage: number
  hasNoClasses: boolean
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  loadClasses: (schoolId: string) => Promise<void>
  getClassById: (classId: string) => IClass | undefined
  setPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: {
    gradeId?: string
    isActive?: boolean
    hasMainTeacher?: boolean
    searchTerm?: string
  }) => void
  addClass: (params: { name: string, schoolId: string, gradeId: number }) => Promise<void>
  updateClass: (params: { classId: string, name: string, gradeId: number }) => Promise<void>
  clearClasses: () => void
}

/**
 * Custom hook to interact with the class store.
 * Provides pagination, filtering, and data access functionality.
 *
 * @returns {UseClassesResult} Object containing class-related functions and data
 */
export function useClasses(): UseClassesResult {
  const {
    classes,
    isLoading,
    error,
    totalCount,
    currentPage,
    itemsPerPage,
    fetchClasses,
    getClassById,
    setPage,
    setItemsPerPage,
    setFilters,
    addClass,
    updateClass,
    clearClasses,
  } = useClassStore()

  const hasNoClasses = classes.length === 0

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const loadClasses = async (schoolId: string): Promise<void> => {
    try {
      await fetchClasses(schoolId)
    }
    catch (error) {
      console.error('Failed to load classes:', error)
      throw error
    }
  }

  return {
    // Data
    classes,
    isLoading,
    error,
    totalCount,
    currentPage,
    itemsPerPage,
    hasNoClasses,

    // Pagination helpers
    pagination: {
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },

    // Actions
    loadClasses,
    getClassById,
    setPage,
    setItemsPerPage,
    setFilters,
    addClass,
    updateClass,
    clearClasses,
  }
}
