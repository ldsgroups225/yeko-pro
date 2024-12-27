import type { IClass, IGrade } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useClasses } from './useClasses'
import { useGrade } from './useGrade'
import { useUser } from './useUser'

interface Filters {
  grade?: string
  search?: string
  active?: boolean
  teacher?: boolean
}

interface UseClassesDataProps {
  initialItemsPerPage: number
  filters: Filters
}

interface UseClassesDataReturn {
  grades?: IGrade[]
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  studentPagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  results: IClass[]
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => void
  currentPage: number
  currentStudentPage: number
  setCurrentPage: (page: number) => void
  setCurrentStudentPage: (page: number) => void
}

export function useClassesData({
  initialItemsPerPage,
  filters,
}: UseClassesDataProps): UseClassesDataReturn {
  const { user } = useUser()
  const { grades } = useGrade()
  const {
    error,
    setPage,
    isLoading,
    setFilters,
    pagination,
    currentPage,
    loadClasses,
    setStudentPage,
    setItemsPerPage,
    classes: results,
    studentPagination,
    currentStudentPage,
  } = useClasses()

  // Use refs to track previous values
  const prevFiltersRef = useRef(filters)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize once
  useEffect(() => {
    setItemsPerPage(initialItemsPerPage)
    setHasInitialized(true)
  }, [])

  function properQsParamsOrUndefined<T>(params: T): T | undefined {
    if (params === '' || params === 'all' || params === 'undefined' || params === undefined) {
      return undefined
    }
    return params
  }

  // Update filters when they change
  useEffect(() => {
    const hasFiltersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)

    if (hasFiltersChanged) {
      setFilters({
        gradeId: properQsParamsOrUndefined(filters.grade),
        isActive: properQsParamsOrUndefined(filters.active),
        hasMainTeacher: properQsParamsOrUndefined(filters.teacher),
        searchTerm: properQsParamsOrUndefined(filters.search),
      })
      prevFiltersRef.current = filters

      // Reset to first page when filters change
      setPage(1)
    }
  }, [filters])

  // useDebouncedCallback class load
  const _debouncedLoadClasses = useDebouncedCallback(async (schoolId: string) => {
    await loadClasses(schoolId)
  }, 0)

  // Load classes when necessary
  useEffect(() => {
    if (user?.school?.id && hasInitialized) {
      _debouncedLoadClasses(user.school.id)?.then(r => r)
    }
  }, [user?.school?.id, currentPage, hasInitialized])

  const status = (() => {
    if (!hasInitialized)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (error)
      return 'error'
    if (results.length > 0)
      return 'success'
    return 'idle'
  })()

  const loadMore = () => {
    setPage(currentPage + 1)
  }

  return {
    grades,
    status,
    results,
    loadMore,
    pagination,
    currentPage,
    studentPagination,
    currentStudentPage,
    setCurrentPage: setPage,
    setCurrentStudentPage: setStudentPage,
  }
}
