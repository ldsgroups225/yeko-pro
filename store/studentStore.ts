import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import {
  createStudent,
  deleteStudent,
  fetchClassesBySchool,
  getStudentById,
  getStudentByIdNumber,
  getStudents,
  updateStudent,
} from '@/services'
import { create } from 'zustand'

interface StudentFilters {
  searchTerm?: string
  selectedClasses?: string[]
  hasNotParentFilter?: boolean
  hasNotClassFilter?: boolean
}

interface StudentStore {
  students: IStudentDTO[]
  groupedClasses: IClassesGrouped[]
  currentSchoolId?: string
  selectedStudent: IStudentDTO | null
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoading: boolean
  totalCount: number | null | undefined
  error: Error | null
  currentPage: number
  itemsPerPage: number
  filters: StudentFilters

  setStudents: (students: IStudentDTO[] | undefined) => void
  setFilters: (newFilters: Partial<StudentFilters>) => void
  setSelectedStudent: (student: IStudentDTO | null) => void
  setIsCreating: (isCreating: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
  setIsDeleting: (isDeleting: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setTotalCount: (totalCount: number | undefined) => void
  setError: (error: Error | null) => void
  setPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  fetchStudents: (query: IStudentsQueryParams) => Promise<void>
  fetchStudentById: (id: string) => Promise<void>
  fetchStudentByIdNumber: (idNumber: string) => Promise<void>
  fetchClassesBySchool: (schoolId: string) => Promise<void>
  createStudent: (student: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateStudent: (student: Partial<IStudentDTO> & { id: string }) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
}

export const useStudentStore = create<StudentStore>((set, get) => {
  return ({
    students: [],
    groupedClasses: [],
    selectedStudent: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isLoading: false,
    totalCount: undefined,
    currentSchoolId: undefined,
    error: null,
    currentPage: 1,
    itemsPerPage: 12,
    filters: {},

    setStudents: students => set({ students }),
    setSelectedStudent: student => set({ selectedStudent: student }),
    setIsCreating: isCreating => set({ isCreating }),
    setIsUpdating: isUpdating => set({ isUpdating }),
    setIsDeleting: isDeleting => set({ isDeleting }),
    setIsLoading: isLoading => set({ isLoading }),
    setTotalCount: totalCount => set({ totalCount }),
    setError: error => set({ error }),

    setFilters: (newFilters) => {
      set({
        filters: { ...get().filters, ...newFilters },
        currentPage: 1,
      })
      if (get().currentSchoolId) {
        get().fetchStudents({ schoolId: get().currentSchoolId! })
      }
    },

    setPage: (page) => {
      set({ currentPage: page })
      if (get().currentSchoolId) {
        get().fetchStudents({ schoolId: get().currentSchoolId })
      }
    },

    setItemsPerPage: (count) => {
      set({
        itemsPerPage: count,
        currentPage: 1,
      })
      if (get().currentSchoolId) {
        get().fetchStudents({ schoolId: get().currentSchoolId })
      }
    },

    fetchStudents: async (query: IStudentsQueryParams) => {
      set({ isLoading: true, error: null, currentSchoolId: query.schoolId })
      try {
        const { data, totalCount } = await getStudents({
          ...query,
          page: get().currentPage,
          limit: get().itemsPerPage,
          ...get().filters,
        })
        set({
          students: data || undefined,
          totalCount: totalCount || undefined,
        })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isLoading: false })
      }
    },

    fetchStudentById: async (id) => {
      set({ isLoading: true, error: null })
      try {
        const student = await getStudentById(id)
        set({ currentSchoolId: student?.schoolId || get().currentSchoolId, selectedStudent: student })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isLoading: false })
      }
    },

    fetchStudentByIdNumber: async (idNumber) => {
      set({ isLoading: true, error: null })
      try {
        const student = await getStudentByIdNumber(idNumber)
        set({ currentSchoolId: student?.schoolId || get().currentSchoolId, selectedStudent: student })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isLoading: false })
      }
    },

    fetchClassesBySchool: async (schoolId) => {
      set({ isLoading: true, error: null })
      try {
        const classes = await fetchClassesBySchool(schoolId)
        set({ groupedClasses: classes })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isLoading: false })
      }
    },

    createStudent: async (student) => {
      set({ isCreating: true, error: null })
      try {
        await createStudent({ ...student, schoolId: student.schoolId || get().currentSchoolId! })
        await get().fetchStudents({ schoolId: student.schoolId! })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isCreating: false })
      }
    },

    updateStudent: async (student) => {
      set({ isUpdating: true, error: null })
      try {
        await updateStudent(student)
        await get().fetchStudents({ schoolId: student.schoolId! })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isUpdating: false })
      }
    },

    deleteStudent: async (id) => {
      set({ isDeleting: true, error: null })
      try {
        await deleteStudent(id)
        await get().fetchStudents({ schoolId: get().currentSchoolId! })
      }
      catch (error: any) {
        set({ error })
      }
      finally {
        set({ isDeleting: false })
      }
    },
  })
})

export default useStudentStore
