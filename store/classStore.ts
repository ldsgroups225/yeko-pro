import type { IClass } from '@/types'
import { createClass, fetchClasses, updateClass } from '@/services'
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
  currentPage: number
  itemsPerPage: number
  filters: ClassFilters
  currentSchoolId?: string

  setClasses: (classes: IClass[]) => void
  setFilters: (filters: Partial<ClassFilters>) => void
  setPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  getClassById: (classId: string) => IClass | undefined
  fetchClasses: (schoolId: string) => Promise<void>
  addClass: (params: { name: string, schoolId: string, gradeId: number }) => Promise<void>
  updateClass: (params: { classId: string, name: string, gradeId: number }) => Promise<void>
  clearClasses: () => void
}

const useClassStore = create<ClassStore>()(
  persist(
    (set, get) => ({
      classes: [],
      isLoading: false,
      error: null,
      totalCount: 0,
      currentPage: 1,
      itemsPerPage: 10,
      filters: {},
      currentSchoolId: undefined,

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

      getClassById: (classId) => {
        return get().classes.find(c => c.id === classId)
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

      clearClasses: () => set({
        classes: [],
        error: null,
        isLoading: false,
        totalCount: 0,
        currentPage: 1,
        filters: {},
        currentSchoolId: undefined,
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
      }),
    },
  ),
)

export default useClassStore
