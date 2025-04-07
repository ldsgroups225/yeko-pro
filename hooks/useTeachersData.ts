import type { ITeacherDTO, ITeacherQueryParams } from '@/types'
import { useUser } from '@/hooks/useUser'
import { useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useTeachers } from './useTeachers'

interface UseTeachersDataProps {
  initialItemsPerPage: number
  filters: ITeacherQueryParams
}

interface UseTeachersDataReturn {
  error: string | null
  teachers: ITeacherDTO[]
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
  updateTeacherStatus: (teacherId: string, status: 'pending' | 'accepted' | 'rejected') => Promise<void>
}

export function useTeachersData({
  initialItemsPerPage,
  filters,
}: UseTeachersDataProps): UseTeachersDataReturn {
  const { user } = useUser()

  const {
    error,
    setPage,
    teachers,
    isLoading,
    setFilters,
    pagination,
    currentPage,
    loadTeachers,
    setItemsPerPage,
    updateTeacherStatus,
  } = useTeachers()

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
        status: properQsParamsOrUndefined(filters.status),
        selectedSubjects: properQsParamsOrUndefined(filters.selectedSubjects),
      })

      prevFiltersRef.current = filters
      setPage(1)
    }
  }, [filters])

  // useDebouncedCallback teacher load
  const _debouncedLoadTeachers = useDebouncedCallback(async (schoolId: string) => {
    await loadTeachers({ schoolId })
  }, 300, { maxWait: 1000 })

  // Load teachers when necessary
  useEffect(() => {
    if (user?.school?.id && hasInitializedRef.current) {
      _debouncedLoadTeachers(user?.school?.id)
    }
  }, [user?.school?.id, currentPage])

  const status = (() => {
    if (!hasInitializedRef.current)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (error)
      return 'error'
    if (teachers.length > 0)
      return 'success'
    return 'idle'
  })()

  const loadMore = () => {
    setPage(currentPage + 1)
  }

  return {
    error,
    status,
    teachers,
    loadMore,
    pagination,
    currentPage,
    setCurrentPage: setPage,
    updateTeacherStatus,
  }
}
