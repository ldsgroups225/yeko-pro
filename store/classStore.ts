import type { ClassDetailsStudent, FilterStudentWhereNotInTheClass, IClass, IClassDetailsStats } from '@/types'
import {
  createClass,
  deleteClass,
  fetchClasses,
  filterStudentWhereNotInTheClass,
  getClassBySlug,
  getClassDetailsStats,
  getClassStudents,
  updateClass,
} from '@/services'
import { create } from 'zustand'

interface ClassFilters {
  gradeId?: string
  isActive?: boolean
  hasMainTeacher?: boolean
  searchTerm?: string
}

interface ClassState {
  classes: IClass[]
  students: ClassDetailsStudent[]
  isLoading: boolean
  error: string | null
  totalCount: number
  totalStudentsCount: number
  currentPage: number
  currentStudentPage: number
  itemsPerPage: number
  studentsPerPage: number
  filters: ClassFilters
  currentSchoolId?: string
  currentClass: IClass | null
}

interface ClassActions {
  setClasses: (classes: IClass[]) => void
  setFilters: (newFilters: Partial<ClassFilters>) => void
  setPage: (page: number) => void
  setStudentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setStudentsPerPage: (count: number) => void
  getClassById: (classId: string) => IClass | undefined
  getClassBySlug: (slug: string) => Promise<IClass | undefined>
  fetchClassBySlug: (slug: string) => Promise<IClass | undefined>
  fetchClasses: (schoolId: string) => Promise<void>
  addClass: (params: { name: string, schoolId: string, gradeId: number }) => Promise<void>
  updateClass: (params: { classId: string, name: string, gradeId: number }) => Promise<IClass>
  deleteClass: (schoolId: string, classId: string) => Promise<void>
  filterStudentWhereNotInTheClass: (schoolId: string, classId: string, search?: string) => Promise<FilterStudentWhereNotInTheClass[]>
  getClassDetailsStats: (
    params: { schoolId: string, classId: string, schoolYearId: number, semesterId: number }
  ) => Promise<IClassDetailsStats>
  getClassStudents: (params: { schoolId: string, classId: string, schoolYearId: number, semesterId: number }) => Promise<void>
  clearClasses: () => void
}

const useClassStore = create<ClassState & ClassActions>((set, get) => ({
  classes: [],
  students: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  totalStudentsCount: 0,
  currentPage: 1,
  currentStudentPage: 1,
  itemsPerPage: 12,
  studentsPerPage: 10,
  filters: {},
  currentSchoolId: undefined,
  currentClass: null,

  setClasses: classes => set({ classes }),

  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
      currentPage: 1,
    })
    if (get().currentSchoolId) {
      get().fetchClasses(get().currentSchoolId!)
    }
  },

  setPage: (page) => {
    set({ currentPage: page })
    if (get().currentSchoolId) {
      get().fetchClasses(get().currentSchoolId!)
    }
  },

  setStudentPage: (page) => {
    set({ currentStudentPage: page })
    if (get().currentSchoolId) {
      get().fetchClasses(get().currentSchoolId!)
    }
  },

  setItemsPerPage: (count) => {
    set({
      itemsPerPage: count,
      currentPage: 1,
    })
    if (get().currentSchoolId) {
      get().fetchClasses(get().currentSchoolId!)
    }
  },

  setStudentsPerPage: (count) => {
    set({
      studentsPerPage: count,
      currentStudentPage: 1,
    })
  },

  getClassById: (classId) => {
    return get().classes.find(c => c.id === classId)
  },

  getClassBySlug: async (slug) => {
    const classroom = get().classes.find(c => c.slug === slug)
    return classroom || await get().fetchClassBySlug(slug)
  },

  fetchClassBySlug: async (slug) => {
    set({ isLoading: true, error: null })
    try {
      const classData = await getClassBySlug(slug)
      set({
        currentClass: classData,
        isLoading: false,
        classes: get().classes.map(c => (c.slug === slug ? classData : c)),
      })
      return classData
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch class'
      set({ error: errorMessage, isLoading: false, currentClass: null })
      throw error
    }
  },

  fetchClasses: async (schoolId) => {
    set({ isLoading: true, error: null, currentSchoolId: schoolId })
    try {
      const data = await fetchClasses({
        schoolId,
        page: get().currentPage,
        limit: get().itemsPerPage,
        ...get().filters,
      })
      set({
        classes: data.classes,
        totalCount: data.totalCount,
        isLoading: false,
      })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch classes'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  addClass: async ({ name, schoolId, gradeId }) => {
    set({ isLoading: true, error: null })
    try {
      await createClass({ name, schoolId, gradeId })

      await get().fetchClasses(get().currentSchoolId!)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create class'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateClass: async ({ classId, name, gradeId }) => {
    set({ isLoading: true, error: null })
    try {
      const updatedClass = await updateClass({ classId, name, gradeId })
      set({
        classes: get().classes.map(c => (c.id === classId ? updatedClass : c)),
        isLoading: false,
      })
      return updatedClass
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update class'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteClass: async (schoolId, classId) => {
    set({ isLoading: true, error: null })
    try {
      await deleteClass(schoolId, classId)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete class'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  getClassDetailsStats: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const data = await getClassDetailsStats({
        schoolId: params.schoolId,
        classId: params.classId,
        schoolYearId: params.schoolYearId,
        semesterId: params.semesterId,
      })
      set({ isLoading: false })
      return data
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch class metrics'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  getClassStudents: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const data = await getClassStudents({
        classId: params.classId,
        schoolId: params.schoolId,
        semesterId: params.semesterId,
        schoolYearId: params.schoolYearId,

        page: get().currentStudentPage,
        limit: get().studentsPerPage,
      })
      set({
        students: data.students,
        isLoading: false,
        totalStudentsCount: data.totalCount,
      })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch class students'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  filterStudentWhereNotInTheClass: async (schoolId, classId, search) => {
    set({ isLoading: true, error: null })
    try {
      const data = await filterStudentWhereNotInTheClass(schoolId, classId, search)
      set({ isLoading: false,
      })

      return data
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch students'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearClasses: () => set({
    classes: [],
    error: null,
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    totalStudentsCount: 0,
    currentStudentPage: 1,
    itemsPerPage: 12,
    studentsPerPage: 10,
    filters: {},
    currentSchoolId: undefined,
    currentClass: null,
  }),
}))

export default useClassStore
