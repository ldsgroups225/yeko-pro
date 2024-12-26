import type { ClassDetailsStudent, IClass, IClassDetailsStats } from '@/types'
import { createClass, fetchClasses, getClassBySlug, getClassDetailsStats, getClassStudents, updateClass } from '@/services'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ClassFilters {
  gradeId?: string
  isActive?: boolean
  hasMainTeacher?: boolean
  searchTerm?: string
}

interface ClassStore {
  classes: IClass[]
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

  setClasses: (classes: IClass[]) => void
  setFilters: (filters: Partial<ClassFilters>) => void
  setPage: (page: number) => void
  setStudentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setStudentsPerPage: (count: number) => void
  getClassById: (classId: string) => IClass | undefined
  getClassBySlug: (slug: string) => Promise< IClass | undefined>
  fetchClassBySlug: (slug: string) => Promise< IClass | undefined>
  fetchClasses: (schoolId: string) => Promise<void>
  addClass: (params: { name: string, schoolId: string, gradeId: number }) => Promise<void>
  updateClass: (params: { classId: string, name: string, gradeId: number }) => Promise<void>
  getClassDetailsStats: (params: { schoolId: string, classId: string, schoolYearId?: number, semesterId?: number }) => Promise<IClassDetailsStats>
  getClassStudents: (params: { schoolId: string, classId: string }) => Promise<ClassDetailsStudent[]>
  clearClasses: () => void
}

const useClassStore = create<ClassStore>()(
  persist(
    (set, get) => ({
      classes: [],
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

      setFilters: async (newFilters) => {
        // First update the filters
        set(state => ({
          filters: { ...state.filters, ...newFilters },
          currentPage: 1,
        }))

        // Then trigger a fetch if we have a schoolId
        const state = get()
        if (state.currentSchoolId) {
          await get().fetchClasses(state.currentSchoolId)
        }
      },

      setPage: async (page) => {
        set({ currentPage: page })

        // Trigger fetch on page change
        const state = get()
        if (state.currentSchoolId) {
          await get().fetchClasses(state.currentSchoolId)
        }
      },

      setStudentPage: async (page) => {
        set({ currentStudentPage: page })

        // Trigger fetch on page change
        const state = get()
        if (state.currentSchoolId) {
          await get().fetchClasses(state.currentSchoolId)
        }
      },

      setItemsPerPage: async (count) => {
        set({
          itemsPerPage: count,
          currentPage: 1,
        })

        // Trigger fetch on items per page change
        const state = get()
        if (state.currentSchoolId) {
          await get().fetchClasses(state.currentSchoolId)
        }
      },

      setStudentsPerPage: async (count) => {
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
          set({ currentClass: classData, isLoading: false })

          // Update the class in the classes array if it exists
          set(state => ({
            classes: state.classes.map(c =>
              c.slug === slug ? classData : c,
            ),
          }))

          return classData
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to fetch class'
          set({ error: errorMessage, isLoading: false, currentClass: null })
          throw error
        }
      },

      addClass: async ({ name, schoolId, gradeId }) => {
        set({ isLoading: true, error: null })
        try {
          const newClass = await createClass({ name, schoolId, gradeId })
          set(state => ({
            classes: [...state.classes, newClass],
            totalCount: state.totalCount + 1,
            isLoading: false,
          }))
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to create class'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      updateClass: async ({ classId, name, gradeId }) => {
        set({ isLoading: true, error: null })
        try {
          const updatedClass = await updateClass({ classId, name, gradeId })
          set(state => ({
            classes: state.classes.map(c =>
              c.id === classId ? updatedClass : c,
            ),
            isLoading: false,
          }))
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to update class'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      fetchClasses: async (schoolId) => {
        const state = get()
        set({ isLoading: true, error: null, currentSchoolId: schoolId })

        try {
          const data = await fetchClasses({
            schoolId,
            page: state.currentPage,
            limit: state.itemsPerPage,
            ...state.filters,
          })

          set({
            classes: data,
            totalCount: data.length,
            isLoading: false,
          })
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to fetch classes'
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
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to fetch class metrics'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      getClassStudents: async (params) => {
        const state = get()
        set({ isLoading: true, error: null })

        try {
          const data = await getClassStudents({
            schoolId: params.schoolId,
            classId: params.classId,
            page: state.currentStudentPage,
            limit: state.studentsPerPage,
          })

          set({ isLoading: false, totalStudentsCount: data.length })

          return data
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to fetch class students'
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
        currentClass: undefined,
      }),
    }),
    {
      name: 'classes-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        classes: state.classes,
        currentPage: state.currentPage,
        itemsPerPage: state.itemsPerPage,
        filters: state.filters,
        currentSchoolId: state.currentSchoolId,
        currentClass: state.currentClass,
      }),
    },
  ),
)

export default useClassStore
