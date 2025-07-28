import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import { useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useStudents } from './useStudents'
import { useUser } from './useUser'

interface UseStudentsDataProps {
  initialItemsPerPage: number
  filters: IStudentsQueryParams
}

interface UseStudentsDataReturn {
  error: string | null
  students: IStudentDTO[]
  groupedClasses: IClassesGrouped[]
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export function useStudentsData({
  initialItemsPerPage,
  filters,
}: UseStudentsDataProps): UseStudentsDataReturn {
  const { user } = useUser()

  const {
    error,
    setPage,
    students,
    isLoading,
    setFilters,
    pagination,
    currentPage,
    loadStudents,
    groupedClasses,
    setItemsPerPage,
    fetchClassesBySchool,
  } = useStudents()

  // Use refs to track previous values
  const prevFiltersRef = useRef(filters)
  const hasInitializedRef = useRef(false)

  // Initialize once
  useEffect(() => {
    if (!hasInitializedRef.current) {
      setItemsPerPage(initialItemsPerPage)
      hasInitializedRef.current = true
    }
  }, [initialItemsPerPage])

  function properQsParamsOrUndefined<T>(params: T): T | undefined {
    if (params === '' || params === 'all' || params === 'undefined' || params === undefined || params === 'false') {
      return undefined
    }
    return params
  }

  // Update filters when they change
  useEffect(() => {
    const hasFiltersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)

    if (hasFiltersChanged) {
      setFilters({
        searchTerm: properQsParamsOrUndefined(filters.searchTerm),
        selectedClasses: properQsParamsOrUndefined(filters.selectedClasses),
        hasNotClassFilter: properQsParamsOrUndefined(filters.hasNotClassFilter),
        hasNotParentFilter: properQsParamsOrUndefined(filters.hasNotParentFilter),
        refusedStudentsFilter: properQsParamsOrUndefined(filters.refusedStudentsFilter),
      })
      prevFiltersRef.current = filters

      // Reset to first page when filters change
      setPage(1)
    }
  }, [filters])

  // useDebouncedCallback class load
  const _debouncedLoadStudents = useDebouncedCallback(async (schoolId: string) => {
    groupedClasses.length === 0 && (await fetchClassesBySchool(schoolId))
    await loadStudents({ schoolId })
  }, 300, { maxWait: 1000 })

  // Load students when necessary
  useEffect(() => {
    if (user?.school?.id && hasInitializedRef.current) {
      _debouncedLoadStudents(user.school.id)?.then(r => r)
    }
  }, [user?.school?.id, currentPage])

  const status = (() => {
    if (!hasInitializedRef.current)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (error)
      return 'error'
    // If we have loaded data (even if empty), return success
    // This helps distinguish between "not loaded yet" and "loaded but empty"
    if (hasInitializedRef.current && !isLoading)
      return 'success'
    return 'idle'
  })()

  const loadMore = () => {
    setPage(currentPage + 1)
  }

  return {
    error,
    status,
    students,
    loadMore,
    pagination,
    currentPage,
    groupedClasses,
    setCurrentPage: setPage,
  }
}
