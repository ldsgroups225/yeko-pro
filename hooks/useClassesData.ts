import { useState, useEffect } from 'react'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { DataModel, Id } from '@/convex/_generated/dataModel'
import { useSchool } from '@/providers/SchoolProvider'

interface UseClassesDataProps {
  initialItemsPerPage: number
}

type IGrade = DataModel['grades']['document']
type IClass = DataModel['classes']['document']

interface UseClassesDataReturn {
  grades?: IGrade[] | null
  results: IClass[]
  status: string
  loadMore: (numItems: number) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  itemsPerPage: number
  selectedGrade: Id<'grades'> | undefined
  setSelectedGrade: (gradeId: Id<'grades'> | undefined) => void
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
export const useClassesData = ({
  initialItemsPerPage,
}: UseClassesDataProps): UseClassesDataReturn => {
  const [selectedGrade, setSelectedGrade] = useState<Id<'grades'>>()
  const [classesActiveState, setClassesActiveState] = useState<
    boolean | undefined
  >(undefined)
  const [hasMainTeacher, setHasMainTeacher] = useState<boolean | undefined>(
    undefined
  )
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = initialItemsPerPage
  const [isTableViewMode, setIsTableViewMode] = useState(true)

  const { school, isLoading: schoolLoading, error: schoolError } = useSchool()
  const grades = useQuery(api.grades.getGrades, { cycleId: school?.cycleId })
  const { results, status, loadMore } = usePaginatedQuery(
    api.classes.getClasses,
    {
      schoolId: school?._id,
      gradeId: selectedGrade,
      isActive: classesActiveState,
      hasMainTeacher: hasMainTeacher,
      search: searchTerm,
      paginationOpts: {
        numItems: itemsPerPage,
        cursor: null,
      },
    },
    { initialNumItems: itemsPerPage }
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
