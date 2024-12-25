import type { IClass, IGrade } from '@/types'
import { useEffect, useState } from 'react'
import { useClasses } from './useClasses'
import { useGrade } from './useGrade'
import { useUser } from './useUser'

interface UseClassesDataProps {
  initialItemsPerPage: number
  initialFilters: {
    grade?: string
    search?: string
    active?: boolean
    teacher?: boolean
  }
}

interface UseClassesDataReturn {
  grades?: IGrade[]
  results: IClass[]
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
}

export function useClassesData({
  initialItemsPerPage,
  initialFilters,
}: UseClassesDataProps): UseClassesDataReturn {
  const { user } = useUser()
  const { grades } = useGrade()
  const {
    classes: results,
    isLoading,
    error,
    loadClasses,
    setPage,
    setItemsPerPage,
    setFilters,
    currentPage,
  } = useClasses()

  // Track if initial load has happened
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize filters with props
  useEffect(() => {
    setFilters({
      gradeId: initialFilters.grade,
      isActive: initialFilters.active,
      hasMainTeacher: initialFilters.teacher,
      searchTerm: initialFilters.search,
    })
    setItemsPerPage(initialItemsPerPage)
    setHasInitialized(true)
  }, []) // Only run this effect once on mount

  // Fetch classes when dependencies change
  useEffect(() => {
    if (user?.school?.id && hasInitialized) {
      loadClasses(user.school.id)
    }
  }, [user?.school?.id, currentPage, hasInitialized])

  // Derive status with improved logic
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
    results,
    status,
    loadMore,
    currentPage,
    setCurrentPage: setPage,
    itemsPerPage: initialItemsPerPage,
  }
}
