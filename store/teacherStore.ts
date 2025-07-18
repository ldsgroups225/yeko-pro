import type { ITeacherDTO, ITeacherOptions, ITeacherQueryParams } from '@/types'
import { create } from 'zustand'
import { createInviteTeacher, getTeachers, getTeacherToSetToCourse, updateTeacherStatus } from '@/services'

interface TeacherFilters {
  searchTerm?: string
  selectedClasses?: string[]
  selectedSubjects?: string[]
  status?: 'pending' | 'accepted' | 'rejected'
}

interface TeacherStore {
  isLoading: boolean
  error: Error | null
  currentPage: number
  itemsPerPage: number
  filters: TeacherFilters
  teachers: ITeacherDTO[]
  currentSchoolId?: string
  totalCount: number | null

  setPage: (page: number) => void
  setError: (error: Error | null) => void
  setItemsPerPage: (count: number) => void
  setIsLoading: (isLoading: boolean) => void
  setTeachers: (teachers: ITeacherDTO[]) => void
  inviteTeacher: () => Promise<string>
  setFilters: (newFilters: Partial<TeacherFilters>) => void
  fetchTeachers: (query: ITeacherQueryParams) => Promise<void>
  getTeacherToSetToCourse: (schoolId: string, search?: string) => Promise<ITeacherOptions[]>
  updateTeacherStatus: (teacherId: string, status: 'pending' | 'accepted' | 'rejected') => Promise<void>
}

export const useTeacherStore = create<TeacherStore>((set, get) => ({
  teachers: [],
  isLoading: false,
  totalCount: null,
  error: null,
  currentPage: 1,
  itemsPerPage: 12,
  filters: {},

  setTeachers: teachers => set({ teachers }),
  setIsLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
      currentPage: 1,
    })
    if (get().currentSchoolId) {
      get().fetchTeachers({ schoolId: get().currentSchoolId })
    }
  },

  setPage: (page) => {
    set({ currentPage: page })
    if (get().currentSchoolId) {
      get().fetchTeachers({ schoolId: get().currentSchoolId })
    }
  },

  setItemsPerPage: (count) => {
    set({
      itemsPerPage: count,
      currentPage: 1,
    })
    if (get().currentSchoolId) {
      get().fetchTeachers({ schoolId: get().currentSchoolId })
    }
  },

  fetchTeachers: async (query: ITeacherQueryParams) => {
    set({ isLoading: true, error: null, currentSchoolId: query.schoolId })
    try {
      const { data, totalCount } = await getTeachers({
        ...query,
        page: get().currentPage,
        limit: get().itemsPerPage,
        ...get().filters,
      })
      set({ teachers: data, totalCount })
    }
    catch (error: any) {
      set({ error })
    }
    finally {
      set({ isLoading: false })
    }
  },

  inviteTeacher: async () => {
    set({ isLoading: true, error: null })
    try {
      return await createInviteTeacher()
    }
    catch (error: any) {
      set({ error })
      throw error
    }
    finally {
      set({ isLoading: false })
    }
  },

  updateTeacherStatus: async (teacherId, status) => {
    set({ isLoading: true, error: null })
    try {
      await updateTeacherStatus(teacherId, get().currentSchoolId!, status)
      await get().fetchTeachers({ schoolId: get().currentSchoolId! })
    }
    catch (error: any) {
      set({ error })
    }
    finally {
      set({ isLoading: false })
    }
  },

  getTeacherToSetToCourse: async (schoolId, search) => {
    set({ isLoading: true, error: null })
    try {
      return await getTeacherToSetToCourse(schoolId, search)
    }
    catch (error: any) {
      set({ error })
      return []
    }
    finally {
      set({ isLoading: false })
    }
  },
}))
