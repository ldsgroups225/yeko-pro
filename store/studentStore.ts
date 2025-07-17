import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import type { LinkStudentParentData, StudentFormValues } from '@/validations'
import { parseISO } from 'date-fns'
import { create } from 'zustand'
import {
  bulkAddStudentsToClass,
  createStudent,
  deleteStudent,
  fetchClassesBySchool,
  getStudentById,
  getStudentByIdNumber,
  getStudentByIdNumberForEdit,
  getStudents,
  linkStudentAndParent,
  updateStudent,
} from '@/services'

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
  studentToEdit: StudentFormValues | null

  setPage: (page: number) => void
  setError: (error: Error | null) => void
  setItemsPerPage: (count: number) => void
  setIsLoading: (isLoading: boolean) => void
  setIsCreating: (isCreating: boolean) => void
  setIsUpdating: (isUpdating: boolean) => void
  setIsDeleting: (isDeleting: boolean) => void
  deleteStudent: (id: string) => Promise<void>
  fetchStudentById: (id: string) => Promise<void>
  setTotalCount: (totalCount: number | undefined) => void
  setSelectedStudent: (student: IStudentDTO | null) => void
  setFilters: (newFilters: Partial<StudentFilters>) => void
  fetchClassesBySchool: (schoolId: string) => Promise<void>
  setStudents: (students: IStudentDTO[] | undefined) => void
  fetchStudentByIdNumber: (idNumber: string) => Promise<void>
  fetchStudents: (query: IStudentsQueryParams) => Promise<void>
  linkStudentAndParent: (data: LinkStudentParentData) => Promise<boolean>
  getStudentByIdNumberForEdit: (idNumber: string) => Promise<StudentFormValues>
  updateStudent: (student: Partial<IStudentDTO> & { id: string }) => Promise<void>
  bulkAddStudentsToClass: (classId: string, studentIdNumber: string[]) => Promise<void>
  createStudent: (student: Omit<IStudentDTO, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => Promise<string>
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
    studentToEdit: null,

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
        const studentId = await createStudent({ ...student, schoolId: student.schoolId || get().currentSchoolId! })
        await get().fetchStudents({ schoolId: student.schoolId! })

        return studentId
      }
      catch (error: any) {
        set({ error })
        return ''
      }
      finally {
        set({ isCreating: false })
      }
    },

    updateStudent: async (student) => {
      set({ isUpdating: true, error: null })
      try {
        const _student = await updateStudent(student)
        const _class = _student.classroom ? { id: _student.classroom.id, name: _student.classroom.name } : undefined

        set({
          studentToEdit: {
            id: _student.id,
            idNumber: _student.idNumber,
            firstName: _student.firstName,
            lastName: _student.lastName,
            classId: _class?.id,
            gradeName: _class?.name,
            dateOfBirth: _student.dateOfBirth ? parseISO(_student.dateOfBirth) : null,
            avatarUrl: _student.avatarUrl ?? null,
            address: _student.address,
            gender: (_student as { gender: 'M' | 'F' | null }).gender,
          },
        })
        await get().fetchStudents({ schoolId: get().currentSchoolId! })
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

    linkStudentAndParent: async (data) => {
      set({ isLoading: true, error: null })
      try {
        const success = await linkStudentAndParent(data)
        if (success) {
          await get().fetchStudents({ schoolId: get().currentSchoolId! })
        }
        return success
      }
      catch (error: any) {
        throw new Error((error as Error).message)
      }
      finally {
        set({ isLoading: false })
      }
    },

    getStudentByIdNumberForEdit: async (idNumber) => {
      set({ isLoading: true, error: null })
      try {
        const oldStudent = get().studentToEdit
        if (oldStudent && oldStudent.idNumber === idNumber)
          return get().studentToEdit!

        const student = await getStudentByIdNumberForEdit(idNumber)
        set({ studentToEdit: student })
        return student
      }
      catch (error: any) {
        throw new Error((error as Error).message)
      }
      finally {
        set({ isLoading: false })
      }
    },

    bulkAddStudentsToClass: async (classId, studentIds) => {
      set({ isLoading: true, error: null })
      try {
        await bulkAddStudentsToClass(classId, studentIds)
        await get().fetchStudents({ schoolId: get().currentSchoolId! })
      }
      catch (error: any) {
        throw new Error((error as Error).message)
      }
      finally {
        set({ isLoading: false })
      }
    },
  })
})

export default useStudentStore
