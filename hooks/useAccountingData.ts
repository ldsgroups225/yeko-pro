import type { StudentWithPaymentStatus } from '@/types/accounting'
import { useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useAccountingStore } from '@/store/accountingStore'

interface UseAccountingDataProps {
  initialItemsPerPage?: number
  filters?: {
    status?: 'paid' | 'overdue'
    searchTerm?: string
  }
}

interface UseAccountingDataReturn {
  students: StudentWithPaymentStatus[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  totalCount: number
  hasMore: boolean
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => Promise<void>
  setFilters: (filters: { status?: 'paid' | 'overdue', searchTerm?: string }) => void
  resetPagination: () => void
}

export function useAccountingData({
  filters = {},
}: UseAccountingDataProps = {}): UseAccountingDataReturn {
  const {
    students,
    isLoading,
    isLoadingMore,
    error,
    totalCount,
    hasMore,
    fetchStudents,
    loadMore,
    setFilters: storeSetFilters,
    resetPagination: storeResetPagination,
  } = useAccountingStore()

  // Use refs to track previous values
  const prevFiltersRef = useRef(filters)
  const hasInitializedRef = useRef(false)

  // Initialize once
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      // Initial fetch with filters
      if (Object.keys(filters).length > 0) {
        storeSetFilters(filters)
      }
      else {
        fetchStudents()
      }
    }
  }, [])

  // Update filters when they change
  useEffect(() => {
    const hasFiltersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)

    if (hasFiltersChanged && hasInitializedRef.current) {
      storeSetFilters(filters)
      prevFiltersRef.current = filters
    }
  }, [filters, storeSetFilters])

  const status = (() => {
    if (!hasInitializedRef.current)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (error)
      return 'error'
    if (students.length > 0)
      return 'success'
    return 'idle'
  })()

  const setFilters = useDebouncedCallback((newFilters: { status?: 'paid' | 'overdue', searchTerm?: string }) => {
    storeSetFilters(newFilters)
  }, 300, { maxWait: 1000 })

  const resetPagination = () => {
    storeResetPagination()
    fetchStudents()
  }

  return {
    students,
    isLoading,
    isLoadingMore,
    error,
    totalCount,
    hasMore,
    status,
    loadMore,
    setFilters,
    resetPagination,
  }
}
