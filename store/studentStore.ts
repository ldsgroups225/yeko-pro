import type { IStudentDTO, IStudentsQueryParams } from '@/types'
import { StudentService } from '@/services'
import { create } from 'zustand'
import useUserStore from './userStore'

interface StudentStore {
  students: IStudentDTO[] | null | undefined
  schoolId: string | null
  selectedStudent: IStudentDTO | null
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isLoading: boolean
  totalCount: number | null | undefined
  error: Error | null

  setStudents: (students: IStudentDTO[] | undefined) => void
  setSelectedStudent: (student: IStudentDTO | null) => void
  setIsCreating: (isCreating: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
  setIsDeleting: (isDeleting: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  setTotalCount: (totalCount: number | undefined) => void
  setError: (error: Error | null) => void
  fetchStudents: (query: IStudentsQueryParams) => Promise<void>
  fetchStudentById: (id: string) => Promise<void>
  fetchStudentByIdNumber: (idNumber: string) => Promise<void>
  createStudent: (student: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateStudent: (student: Partial<IStudentDTO> & { id: string }) => Promise<void>
  deleteStudent: (id: string) => Promise<void>
}

export const useStudentStore = create<StudentStore>((set, get) => {
  return ({
    students: undefined,
    selectedStudent: null,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isLoading: false,
    totalCount: undefined,
    schoolId: null,
    error: null,

    setStudents: students => set({ students }),
    setSelectedStudent: student => set({ selectedStudent: student }),
    setIsCreating: isCreating => set({ isCreating }),
    setIsUpdating: isUpdating => set({ isUpdating }),
    setIsDeleting: isDeleting => set({ isDeleting }),
    setIsLoading: isLoading => set({ isLoading }),
    setTotalCount: totalCount => set({ totalCount }),
    setError: error => set({ error }),

    fetchStudents: async (query: IStudentsQueryParams) => {
      set({ isLoading: true, error: null })
      try {
        const studentService = StudentService.getInstance()
        const { data, totalCount } = await studentService.getStudents(query)
        set({
          schoolId: query.schoolId,
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
        const studentService = StudentService.getInstance()
        const student = await studentService.getStudentById(id)
        set({ schoolId: student?.schoolId, selectedStudent: student })
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
        const studentService = StudentService.getInstance()
        const student = await studentService.getStudentByIdNumber(idNumber)
        set({ schoolId: student?.schoolId, selectedStudent: student })
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
        const studentService = StudentService.getInstance()
        await studentService.createStudent({ ...student, schoolId: student.schoolId || get().schoolId! })
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
        const studentService = StudentService.getInstance()
        await studentService.updateStudent(student)
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
        const studentService = StudentService.getInstance()
        await studentService.deleteStudent(id)
        await get().fetchStudents({ schoolId: get().schoolId! })
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
