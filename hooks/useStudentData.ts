import type { IGrade, IStudentDTO } from '../types'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useGrade } from './useGrade'
import { useStudent } from './useStudent'
import { useUser } from './useUser'

interface Filters {
  grade?: string
  search?: string
  active?: boolean
}

interface UseStudentDataProps {
  initialItemsPerPage: number
  filters: Filters
}

interface UseStudentDataReturn {
  grades?: IGrade[]
  pagination: {
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  results: IStudentDTO[]
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
}

export function useStudentData({
  initialItemsPerPage,
  filters,
}: UseStudentDataProps): UseStudentDataReturn {
  const { user } = useUser()
  const { grades } = useGrade()
  const {
    error,
    setPage,
    isLoading,
    setFilters: setStudentFilters,
    pagination,
    currentPage,
    loadStudents,
    students: results,
    setItemsPerPage,
  } = useStudent()

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
      setStudentFilters({
        gradeId: properQsParamsOrUndefined(filters.grade),
        isActive: properQsParamsOrUndefined(filters.active),
        searchTerm: properQsParamsOrUndefined(filters.search),
      })
      prevFiltersRef.current = filters

      // Reset to first page when filters change
      setPage(1)
    }
  }, [filters, setStudentFilters, setPage])

  // useDebouncedCallback student load
  const _debouncedLoadStudents = useDebouncedCallback(async (schoolId: string) => {
    await loadStudents({ schoolId })
  }, 0)

  // Load students when necessary
  useEffect(() => {
    if (user?.school?.id && hasInitialized) {
      _debouncedLoadStudents(user.school.id)
    }
  }, [user?.school?.id, currentPage, hasInitialized, _debouncedLoadStudents])

  const status = (() => {
    if (!hasInitialized)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (error)
      return 'error'
    if ((results ?? []).length > 0)
      return 'success'
    return 'idle'
  })()

  const loadMore = () => {
    setPage(currentPage + 1)
  }

  return {
    grades,
    status,
    results: results ?? [],
    loadMore,
    pagination,
    currentPage,
    setCurrentPage: setPage,
  }
}
