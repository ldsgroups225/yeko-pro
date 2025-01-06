import type { ITeacherDTO, ITeacherQueryParams } from '@/types'
import { useTeacherStore } from '@/store/teacherStore'

interface UseTeachersResult {
  teachers: ITeacherDTO[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  itemsPerPage: number
  hasNoTeachers: boolean
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  loadTeachers: (params: ITeacherQueryParams) => Promise<void>
  getTeacherById: (teacherId: string) => ITeacherDTO | undefined
  setPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: Partial<TeacherFilters>) => void
  updateTeacherStatus: (teacherId: string, status: 'pending' | 'accepted' | 'rejected') => Promise<void>
  clearTeachers: () => void
}

interface TeacherFilters {
  searchTerm?: string
  selectedClasses?: string[]
  selectedSubjects?: string[]
  status?: 'pending' | 'accepted' | 'rejected'
}

/**
 * Custom hook to interact with the teacher store.
 * Provides pagination, filtering, and data access functionality.
 *
 * @returns {UseTeachersResult} Object containing teacher-related functions and data
 */
export function useTeachers(): UseTeachersResult {
  const {
    teachers,
    isLoading,
    error,
    itemsPerPage,
    totalCount,
    fetchTeachers,
    updateTeacherStatus: storeUpdateStatus,
    setPage,
    setItemsPerPage,
    setFilters,
    currentPage,
  } = useTeacherStore()

  const hasNoTeachers = !teachers || teachers.length === 0

  const totalPages = Math.ceil((totalCount || 0) / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const loadTeachers = async (params: ITeacherQueryParams): Promise<void> => {
    try {
      await fetchTeachers(params)
    }
    catch (error) {
      console.error('Failed to load teachers:', error)
      throw error
    }
  }

  const getTeacherById = (teacherId: string) => {
    return teachers?.find(teacher => teacher.id === teacherId)
  }

  const clearTeachers = () => {
    useTeacherStore.getState().setTeachers([])
    useTeacherStore.getState().setFilters({})
  }

  return {
    teachers,
    isLoading,
    error: error?.message || null,
    totalCount: totalCount || 0,
    currentPage,
    itemsPerPage,
    hasNoTeachers,
    pagination: {
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    loadTeachers,
    getTeacherById,
    setPage,
    setItemsPerPage,
    setFilters,
    updateTeacherStatus: storeUpdateStatus,
    clearTeachers,
  }
}
