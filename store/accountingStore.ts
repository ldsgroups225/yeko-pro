import type { StudentWithPaymentStatus } from '@/types/accounting'
import { create } from 'zustand'
import { getStudentsWithPaymentStatus } from '@/services/accountingService'

interface AccountingFilters {
  status?: 'paid' | 'overdue'
  searchTerm?: string
}

interface AccountingState {
  students: StudentWithPaymentStatus[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  totalCount: number
  currentPage: number
  itemsPerPage: number
  filters: AccountingFilters
  hasMore: boolean
}

interface AccountingActions {
  setStudents: (students: StudentWithPaymentStatus[]) => void
  setIsLoading: (isLoading: boolean) => void
  setIsLoadingMore: (isLoadingMore: boolean) => void
  setError: (error: string | null) => void
  setTotalCount: (totalCount: number) => void
  setCurrentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: Partial<AccountingFilters>) => void
  setHasMore: (hasMore: boolean) => void
  fetchStudents: (filters?: Partial<AccountingFilters>) => Promise<void>
  loadMore: () => Promise<void>
  resetPagination: () => void
  clearStudents: () => void
}

export const useAccountingStore = create<AccountingState & AccountingActions>((set, get) => ({
  students: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  itemsPerPage: 12,
  filters: {},
  hasMore: true,

  setStudents: students => set({ students }),
  setIsLoading: isLoading => set({ isLoading }),
  setIsLoadingMore: isLoadingMore => set({ isLoadingMore }),
  setError: error => set({ error }),
  setTotalCount: totalCount => set({ totalCount }),
  setCurrentPage: currentPage => set({ currentPage }),
  setItemsPerPage: itemsPerPage => set({ itemsPerPage }),
  setHasMore: hasMore => set({ hasMore }),

  setFilters: (newFilters) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }

    set({
      filters: updatedFilters,
      currentPage: 1,
      students: [],
      hasMore: true,
    })

    // Fetch students with new filters
    get().fetchStudents(updatedFilters)
  },

  fetchStudents: async (filters = {}) => {
    const currentFilters = get().filters
    const mergedFilters = { ...currentFilters, ...filters }

    set({ isLoading: true, error: null })

    try {
      const { data, totalCount } = await getStudentsWithPaymentStatus({
        ...mergedFilters,
        page: get().currentPage,
        limit: get().itemsPerPage,
      })

      const hasMore = data.length === get().itemsPerPage
        && (get().currentPage * get().itemsPerPage) < totalCount

      set({
        students: data,
        totalCount,
        hasMore,
        isLoading: false,
      })
    }
    catch (error: any) {
      set({
        error: error.message || 'Failed to fetch students',
        isLoading: false,
      })
    }
  },

  loadMore: async () => {
    if (get().isLoadingMore || !get().hasMore)
      return

    set({ isLoadingMore: true, error: null })

    try {
      const nextPage = get().currentPage + 1
      const { data, totalCount } = await getStudentsWithPaymentStatus({
        ...get().filters,
        page: nextPage,
        limit: get().itemsPerPage,
      })

      const hasMore = data.length === get().itemsPerPage
        && (nextPage * get().itemsPerPage) < totalCount

      set({
        students: [...get().students, ...data],
        currentPage: nextPage,
        hasMore,
        isLoadingMore: false,
      })
    }
    catch (error: any) {
      set({
        error: error.message || 'Failed to load more students',
        isLoadingMore: false,
      })
    }
  },

  resetPagination: () => {
    set({
      currentPage: 1,
      students: [],
      hasMore: true,
      error: null,
    })
  },

  clearStudents: () => {
    set({
      students: [],
      currentPage: 1,
      hasMore: true,
      error: null,
    })
  },
}))
