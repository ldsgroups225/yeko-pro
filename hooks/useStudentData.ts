import type { IClass, IGrade, IStudentDTO, IStudentsQueryParams } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useClasses, useGrade, useStudent, useUser } from './index'

interface UseStudentDataProps {
  initialItemsPerPage: number
  filters: IStudentsQueryParams
}

interface UseStudentDataReturn {
  grades?: IGrade[]
  classes?: IClass[]
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
  isLoading: boolean
  error?: Error
}

export function useStudentData({
  initialItemsPerPage,
  filters,
}: UseStudentDataProps): UseStudentDataReturn {
  console.log('======================')
  const { user } = useUser()
  const { grades } = useGrade()
  const { classes } = useClasses()
  const {
    error: studentError,
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

  // const properQsParamsOrUndefined = <T>(params: T): T | undefined => {
  //   if (
  //     params === ''
  //     || params === 'all'
  //     || params === 'undefined'
  //     || params === undefined
  //     || (Array.isArray(params) && params.length === 0)
  //   ) {
  //     return undefined
  //   }
  //   return params
  // }

  // Update filters when they change
  useEffect(() => {
    const hasFiltersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)
    if (hasFiltersChanged) {
      console.log('Filters changed:', filters)
      // setStudentFilters({
      //   gradeId: properQsParamsOrUndefined(filters.schoolId),
      //   isActive: true,
      //   searchTerm: properQsParamsOrUndefined(filters.searchTerm),
      // })

      prevFiltersRef.current = filters

      // Reset to first page when filters change
      setPage(1)
    }
  }, [filters])

  const _debouncedLoadStudents = useDebouncedCallback(
    async (schoolId: string) => {
      try {
        await loadStudents({ schoolId })
      }
      catch (err) {
        console.error('Failed to load students:', err)
      }
    },
    300,
    { maxWait: 1000 },
  )

  // Load students when necessary
  useEffect(() => {
    // TODO: Check if hasInitialized must be true or false
    if (user?.school?.id && hasInitialized) {
      _debouncedLoadStudents(user.school.id)?.then(r => r)
    }
  }, [user?.school?.id, currentPage, hasInitialized])

  const status = (() => {
    if (!user?.school?.id)
      return 'idle'
    if (isLoading)
      return 'loading'
    if (studentError)
      return 'error'
    if ((results ?? []).length > 0)
      return 'success'
    return 'idle'
  })()

  const loadMore = () => {
    setPage(currentPage + 1)
  }

  const error = studentError ? new Error(studentError.toString()) : undefined

  return {
    grades,
    classes,
    status,
    results: results ?? [],
    loadMore,
    pagination,
    currentPage,
    setCurrentPage: setPage,
    isLoading,
    error,
  }
}
