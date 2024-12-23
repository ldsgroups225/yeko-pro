import type { IClass, IGrade } from '@/types'
import { useEffect, useState } from 'react'
import { useClasses } from './useClasses'
import { useGrade } from './useGrade'
import { useUser } from './useUser'

interface UseClassesDataProps {
  initialItemsPerPage: number
  initialGrade?: string
  initialSearchTerm?: string
  initialClassesActiveState?: boolean
  initialHasMainTeacher?: boolean
}

interface UseClassesDataReturn {
  grades?: IGrade[]
  results: IClass[]
  status: 'idle' | 'loading' | 'error' | 'success'
  loadMore: () => void
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  selectedGrade?: string
  setSelectedGrade: (gradeId?: string) => void
  classesActiveState?: boolean
  setClassesActiveState: (isActive?: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  hasMainTeacher?: boolean
  setHasMainTeacher: (hasTeacher?: boolean) => void
}

export function useClassesData({
  initialItemsPerPage,
  initialGrade,
  initialSearchTerm = '',
  initialClassesActiveState,
  initialHasMainTeacher,
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
      gradeId: initialGrade,
      isActive: initialClassesActiveState,
      hasMainTeacher: initialHasMainTeacher,
      searchTerm: initialSearchTerm,
    })
    setItemsPerPage(initialItemsPerPage)
    setHasInitialized(true)
  }, [])

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

  const setSelectedGrade = (gradeId?: string) => {
    setFilters({ gradeId })
  }

  const setClassesActiveState = (isActive?: boolean) => {
    setFilters({ isActive })
  }

  const setSearchTerm = (term: string) => {
    setFilters({ searchTerm: term })
  }

  const setHasMainTeacher = (hasTeacher?: boolean) => {
    setFilters({ hasMainTeacher: hasTeacher })
  }

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
    selectedGrade: initialGrade,
    setSelectedGrade,
    classesActiveState: initialClassesActiveState,
    setClassesActiveState,
    searchTerm: initialSearchTerm,
    setSearchTerm,
    hasMainTeacher: initialHasMainTeacher,
    setHasMainTeacher,
  }
}
