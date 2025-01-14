import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import useStudentStore from '@/store/studentStore'
import { useDebouncedCallback } from 'use-debounce'

interface UseStudentsResult {
  students: IStudentDTO[]
  isLoading: boolean
  error: string | null
  totalCount: number | undefined
  currentPage: number
  itemsPerPage: number
  hasNoStudents: boolean
  groupedClasses: IClassesGrouped[]
  currentStudent: IStudentDTO | null
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }

  fetchClassesBySchool: (schoolId: string) => Promise<void>
  loadStudents: (params: IStudentsQueryParams) => Promise<void>
  getStudentById: (studentId: string) => IStudentDTO | undefined
  linkStudentAndParent: (data: { studentIdNumber: string, otp: string }) => Promise<boolean>
  setPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: {
    searchTerm?: string
    selectedClasses?: string[]
    hasNotParentFilter?: boolean
    hasNotClassFilter?: boolean
  }) => void
  addStudent: (params: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateStudent: (params: Partial<IStudentDTO> & { id: string }) => Promise<void>
  deleteStudent: (studentId: string) => Promise<void>
  clearStudents: () => void
}

/**
 * Custom hook to interact with the student store.
 * Provides pagination, filtering, and data access functionality.
 *
 * @returns {UseStudentsResult} Object containing student-related functions and data
 */
export function useStudents(): UseStudentsResult {
  const {
    students,
    groupedClasses,
    isLoading,
    error,
    itemsPerPage,
    totalCount,
    fetchStudents,
    updateStudent: storeUpdateStudent,
    deleteStudent: storeDeleteStudent,
    selectedStudent,
    // setIsLoading,
    setPage,
    setItemsPerPage,
    setFilters,
    createStudent,
    currentPage,
    fetchClassesBySchool,
    linkStudentAndParent,
  } = useStudentStore()

  // Use refs to track previous values
  // const prevFiltersRef = useRef(filters)
  // const [hasInitialized, setHasInitialized] = useState(false)

  const hasNoStudents = students === undefined || students?.length === 0

  const totalPages = Math.ceil((totalCount || 0) / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPreviousPage = currentPage > 1

  const loadStudents = async (params: IStudentsQueryParams): Promise<void> => {
    try {
      await fetchStudents(params)
    }
    catch (error) {
      console.error('Failed to load students:', error)
      throw error
    }
  }

  const _debouncedLoadStudents = useDebouncedCallback(
    async (params: IStudentsQueryParams) => {
      try {
        groupedClasses.length === 0 && (await fetchClassesBySchool(params.schoolId!))
        await loadStudents(params)
      }
      catch (err) {
        console.error('Failed to load students:', err)
      }
    },
    300,
    { maxWait: 1000 },
  )

  const addStudent = async (
    params: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> => {
    try {
      await createStudent(params)
    }
    catch (error: any) {
      console.error('Failed to add student:', error.message)
    }
  }

  const updateStudent = async (
    params: Partial<IStudentDTO> & { id: string },
  ): Promise<void> => {
    try {
      await storeUpdateStudent(params)
    }
    catch (error: any) {
      console.error('Failed to update student:', error.message)
    }
  }

  const deleteStudent = async (studentId: string): Promise<void> => {
    try {
      await storeDeleteStudent(studentId)
    }
    catch (error: any) {
      console.error('Failed to delete student:', error.message)
    }
  }

  const getStudentById = (studentId: string) => {
    return students?.find(student => student.id === studentId)
  }

  const clearStudents = () => {
    useStudentStore.getState().setStudents(undefined)
    useStudentStore.getState().setFilters({})
  }

  return {
    students: students ?? [],
    groupedClasses,
    isLoading,
    error: error?.message || null,
    totalCount: totalCount || 0,
    currentPage,
    itemsPerPage,
    hasNoStudents,
    fetchClassesBySchool,
    currentStudent: selectedStudent || null,
    linkStudentAndParent,
    pagination: {
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    loadStudents,
    getStudentById,
    setPage,
    setItemsPerPage,
    setFilters,
    addStudent,
    updateStudent,
    deleteStudent,
    clearStudents,
  }
}
