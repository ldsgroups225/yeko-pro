import type { IClassesGrouped, IStudentDTO, IStudentsQueryParams } from '@/types'
import { useEffect, useRef, useState } from 'react'
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
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize once
  useEffect(() => {
    setItemsPerPage(initialItemsPerPage)
    setHasInitialized(true)
  }, [])

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
        hasNotClassFilter: properQsParamsOrUndefined(filters.hasNotClassFilter),
        hasNotParentFilter: properQsParamsOrUndefined(filters.hasNotParentFilter),
        searchTerm: properQsParamsOrUndefined(filters.searchTerm),
        selectedClasses: properQsParamsOrUndefined(filters.selectedClasses),
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
    if (user?.school?.id && hasInitialized) {
      _debouncedLoadStudents(user.school.id)?.then(r => r)
    }
  }, [user?.school?.id, currentPage, hasInitialized])

  const status = (() => {
    if (!hasInitialized)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (error)
      return 'error'
    if (students.length > 0)
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
