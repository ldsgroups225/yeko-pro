import type { GradeId, IClass, IGrade } from '@/types'
import { api } from '@/convex/_generated/api'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { useSchool } from './useSchool'

interface UseClassesDataProps {
  initialItemsPerPage: number
  initialGrade?: GradeId
  initialSearchTerm?: string
  initialClassesActiveState?: boolean
  initialHasMainTeacher?: boolean
}

interface UseClassesDataReturn {
  grades?: IGrade[] | null
  results: IClass[]
  status: string
  loadMore: (numItems: number) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  selectedGrade: GradeId | undefined
  setSelectedGrade: (gradeId: GradeId | undefined) => void
  classesActiveState: boolean | undefined
  setClassesActiveState: (isActive: boolean | undefined) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  hasMainTeacher: boolean | undefined
  setHasMainTeacher: (hasTeacher: boolean | undefined) => void
}

/**
 * Custom hook to fetch and manage classes data.
 *
 * @param {UseClassesDataProps} props - The props for the hook.
 * @returns {UseClassesDataReturn} - The data and functions for managing classes.
 */
export function useClassesData({
  initialItemsPerPage,
  initialGrade,
  initialSearchTerm = '',
  initialClassesActiveState,
  initialHasMainTeacher,
}: UseClassesDataProps): UseClassesDataReturn {
  const [selectedGrade, setSelectedGrade] = useState<GradeId | undefined>(initialGrade)
  const [classesActiveState, setClassesActiveState] = useState<
    boolean | undefined
  >(initialClassesActiveState)
  const [hasMainTeacher, setHasMainTeacher] = useState<boolean | undefined>(
    initialHasMainTeacher,
  )
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = initialItemsPerPage

  const { school } = useSchool()
  const grades = useQuery(api.grades.getGrades, { cycleId: school?.cycleId })
  const { results, status, loadMore } = usePaginatedQuery<any>(
    api.classes.getClasses,
    {
      schoolId: school?._id,
      gradeId: selectedGrade,
      isActive: classesActiveState,
      hasMainTeacher,
      search: searchTerm,
      paginationOpts: {
        numItems: itemsPerPage,
        cursor: null,
      },
    },
    { initialNumItems: itemsPerPage },
  )

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedGrade, searchTerm, classesActiveState, hasMainTeacher])

  return {
    grades,
    results,
    status,
    loadMore,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedGrade,
    setSelectedGrade,
    classesActiveState,
    setClassesActiveState,
    searchTerm,
    setSearchTerm,
    hasMainTeacher,
    setHasMainTeacher,
  }
}
