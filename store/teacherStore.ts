import type { ITeacherDTO, ITeacherQueryParams } from '@/types'
import { createInviteTeacher, getTeachers, updateTeacherStatus } from '@/services'
import { create } from 'zustand'

interface TeacherFilters {
  searchTerm?: string
  selectedClasses?: string[]
  selectedSubjects?: string[]
  status?: 'pending' | 'accepted' | 'rejected'
}

interface TeacherStore {
  teachers: ITeacherDTO[]
  currentSchoolId?: string
  isLoading: boolean
  totalCount: number | null
  error: Error | null
  currentPage: number
  itemsPerPage: number
  filters: TeacherFilters

  setTeachers: (teachers: ITeacherDTO[]) => void
  setFilters: (newFilters: Partial<TeacherFilters>) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  setPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  fetchTeachers: (query: ITeacherQueryParams) => Promise<void>
  updateTeacherStatus: (teacherId: string, status: 'pending' | 'accepted' | 'rejected') => Promise<void>
  inviteTeacher: (schoolId: string) => Promise<string>
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

  inviteTeacher: async (schoolId: string) => {
    set({ isLoading: true, error: null })
    try {
      return await createInviteTeacher(schoolId)
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
}))
