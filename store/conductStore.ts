import type { IConductQueryParams, IConductStats, IConductStudent } from '@/types'
import { create } from 'zustand'
import { fetchClassesForFilter, fetchConductStats, fetchConductStudents } from '@/services'

// Define the state interface
interface ConductState {
  students: IConductStudent[]
  stats: IConductStats | null
  classes: { id: string, name: string }[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  filters: IConductQueryParams
}

// Define the actions interface
interface ConductActions {
  setStudents: (students: IConductStudent[]) => void
  setStats: (stats: IConductStats) => void
  setClasses: (classes: { id: string, name: string }[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<IConductQueryParams>) => void
  setCurrentPage: (page: number) => void
  fetchStudents: (params?: IConductQueryParams) => Promise<void>
  fetchStats: () => Promise<void>
  fetchClassesForFilter: () => Promise<void>
  clearData: () => void
  refreshData: () => Promise<void>
}

// Create the store with state and actions
const useConductStore = create<ConductState & ConductActions>((set, get) => ({
  // Initial state
  students: [],
  stats: null,
  classes: [],
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  filters: {
    page: 1,
    limit: 12,
    sort: { column: 'lastName', direction: 'asc' },
  },

  // Actions
  setStudents: students => set({ students, error: null }),

  setStats: stats => set({ stats, error: null }),

  setClasses: classes => set({ classes, error: null }),

  setLoading: isLoading => set({ isLoading }),

  setError: error => set({ error, isLoading: false }),

  setFilters: newFilters => set(state => ({
    filters: { ...state.filters, ...newFilters },
    currentPage: newFilters.page || state.currentPage,
  })),

  setCurrentPage: currentPage => set(state => ({
    currentPage,
    filters: { ...state.filters, page: currentPage },
  })),

  fetchStudents: async (params) => {
    const { filters } = get()
    const queryParams = { ...filters, ...params }

    set({ isLoading: true, error: null })

    try {
      const { students, totalCount, stats } = await fetchConductStudents(queryParams)
      set({
        students,
        totalCount,
        stats,
        isLoading: false,
        filters: queryParams,
      })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des données de conduite'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null })

    try {
      const stats = await fetchConductStats()
      set({ stats, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  fetchClassesForFilter: async () => {
    try {
      const classes = await fetchClassesForFilter()
      set({ classes })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des classes'
      set({ error: errorMessage })
      throw error
    }
  },

  clearData: () => set({
    students: [],
    stats: null,
    classes: [],
    error: null,
    isLoading: false,
    totalCount: 0,
    currentPage: 1,
    filters: {
      page: 1,
      limit: 12,
      sort: { column: 'lastName', direction: 'asc' },
    },
  }),

  refreshData: async () => {
    const { filters } = get()
    await get().fetchStudents(filters)
    await get().fetchStats()
  },
}))

export default useConductStore
