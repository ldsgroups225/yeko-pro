import type { ClassDetailsStudent, IClass, IClassDetailsStats } from '@/types'
import useClassStore from '@/store/classStore'

interface UseClassesResult {
  classes: IClass[]
  isLoading: boolean
  error: string | null
  totalCount: number
  totalStudentsCount: number
  currentPage: number
  currentStudentPage: number
  itemsPerPage: number
  studentsPerPage: number
  hasNoClasses: boolean
  currentClass: IClass | null
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  studentPagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  loadClasses: (schoolId: string) => Promise<void>
  loadClassStudents: (schoolId: string, classId: string) => Promise<ClassDetailsStudent[]>
  getClassById: (classId: string) => IClass | undefined
  setPage: (page: number) => void
  setStudentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: {
    gradeId?: string
    isActive?: boolean
    hasMainTeacher?: boolean
    searchTerm?: string
  }) => void
  addClass: (params: { name: string, schoolId: string, gradeId: number }) => Promise<void>
  updateClass: (params: { classId: string, name: string, gradeId: number }) => Promise<void>
  loadMoreStudents: () => void
  getClassBySlug: (slug: string) => Promise<IClass | undefined>
  getClassDetailsStats: (params: { schoolId: string, classId: string, schoolYearId?: number, semesterId?: number }) => Promise<IClassDetailsStats>
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
    currentClass,
    getClassBySlug,
    getClassDetailsStats,
    getClassStudents,
    fetchClasses,
    getClassById,
    setPage,
    setStudentPage,
    setItemsPerPage,
    setFilters,
    addClass,
    updateClass,
    clearClasses,
    totalStudentsCount,
    currentStudentPage,
    studentsPerPage,
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

  const loadMoreStudents = () => {
    setStudentPage(currentStudentPage + 1)
  }

  const totalStudentPages = Math.ceil(totalStudentsCount / studentsPerPage)
  const hasNextStudentPage = currentStudentPage < totalStudentPages
  const hasPreviousStudentPage = currentStudentPage > 1

  // students
  const loadClassStudents = async (schoolId: string, classId: string): Promise<ClassDetailsStudent[]> => {
    try {
      return await getClassStudents({ schoolId, classId })
    }
    catch (error) {
      console.error('Failed to load class students:', error)
      throw error
    }
  }

  return {
    // Data
    classes,
    isLoading,
    error,
    totalCount,
    totalStudentsCount,
    currentPage,
    currentStudentPage,
    itemsPerPage,
    studentsPerPage,
    hasNoClasses,
    currentClass,

    // Pagination helpers
    pagination: {
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },

    studentPagination: {
      totalPages: totalStudentPages,
      hasNextPage: hasNextStudentPage,
      hasPreviousPage: hasPreviousStudentPage,
    },

    // Actions
    loadClasses,
    loadClassStudents,
    getClassById,
    setPage,
    setStudentPage,
    setItemsPerPage,
    setFilters,
    addClass,
    loadMoreStudents,
    updateClass,
    clearClasses,
    getClassBySlug,
    getClassDetailsStats,
  }
}
