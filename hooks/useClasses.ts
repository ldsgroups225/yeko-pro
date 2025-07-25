import type { ClassDetailsStudent, FilterStudentWhereNotInTheClass, IClass, IClassDetailsStats } from '@/types'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import useClassStore from '@/store/classStore'
import { useSchoolYear } from './useSchoolYear'
import { useUser } from './useUser'

interface UseClassesResult {
  classes: IClass[]
  students: ClassDetailsStudent[]
  isLoading: boolean
  error: string | null
  totalCount: number
  totalStudentsCount: number
  currentPage: number
  currentStudentPage: number
  itemsPerPage: number
  studentsPerPage: number
  hasNoClasses: boolean
  currentClass: IClass | null
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
  loadClasses: (schoolId: string) => Promise<void>
  loadClassStudents: (schoolId: string, classId: string) => Promise<void>
  getClassById: (classId: string) => IClass | undefined
  setPage: (page: number) => void
  setStudentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: {
    gradeId?: string
    isActive?: boolean
    hasMainTeacher?: boolean
    searchTerm?: string
  }) => void
  addClass: (params: { name: string, schoolId: string, gradeId: number, maxStudent: number }) => Promise<void>
  updateClass: (params: { classId: string, name: string, gradeId: number, maxStudent: number }) => Promise<IClass>
  deleteClass: (schoolId: string, classId: string) => Promise<void>
  filterStudentWhereNotInTheClass: (schoolId: string, classId: string, search?: string) => Promise<FilterStudentWhereNotInTheClass[]>
  loadMoreStudents: () => void
  getClassBySlug: (slug: string) => Promise<IClass | undefined>
  getClassDetailsStats: (params: {
    schoolId: string
    classId: string
  }) => Promise<IClassDetailsStats>
  clearClasses: () => void
  activateDeactivateClass: (classId: string, isActive: boolean) => Promise<void>
}

/**
 * Custom hook to interact with the class store.
 * Provides pagination, filtering, and data access functionality with optimized memoization.
 */
export function useClasses(): UseClassesResult {
  const { user } = useUser()
  const { selectedSchoolYearId, activeSemester } = useSchoolYear()

  const {
    error,
    classes,
    setPage,
    students,
    addClass,
    isLoading,
    totalCount,
    setFilters,
    currentPage,
    updateClass,
    deleteClass,
    itemsPerPage,
    clearClasses,
    currentClass,
    getClassById,
    fetchClasses,
    getClassBySlug,
    setStudentPage,
    setItemsPerPage,
    studentsPerPage,
    getClassStudents,
    totalStudentsCount,
    currentStudentPage,
    getClassDetailsStats,
    activateDeactivateClass,
    filterStudentWhereNotInTheClass,
  } = useClassStore()

  const alreadyClass = useRef('')

  const hasNoClasses = useMemo(() => classes.length === 0, [classes])

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(totalCount / itemsPerPage)
    return {
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  }, [totalCount, itemsPerPage, currentPage])

  const studentPagination = useMemo(() => {
    const totalStudentPages = Math.ceil(totalStudentsCount / studentsPerPage)
    return {
      totalPages: totalStudentPages,
      hasNextPage: currentStudentPage < totalStudentPages,
      hasPreviousPage: currentStudentPage > 1,
    }
  }, [totalStudentsCount, studentsPerPage, currentStudentPage])

  const shouldReloadStudents = useCallback((classId: string): boolean => {
    if (alreadyClass.current === '')
      return true

    const shouldReload = alreadyClass.current !== classId

    if (shouldReload) {
      alreadyClass.current = classId
    }

    return shouldReload
  }, [])

  const loadClasses = useCallback(async (schoolId: string): Promise<void> => {
    try {
      await fetchClasses(schoolId)
    }
    catch (error) {
      console.error('Failed to load classes:', error)
      throw error
    }
  }, [])

  const fetchClassDetailsStats = useCallback(async (params: { schoolId: string, classId: string }): Promise<IClassDetailsStats> => {
    try {
      return await getClassDetailsStats({
        schoolId: params.schoolId,
        classId: params.classId,
        schoolYearId: selectedSchoolYearId,
        semesterId: activeSemester?.id,
      })
    }
    catch (error) {
      console.error('Failed to load class\'s stats:', error)
      throw error
    }
  }, [selectedSchoolYearId, activeSemester])

  const _debouncedLoadClassStudents = useDebouncedCallback(
    async (classId: string) => {
      if (activeSemester === null)
        return

      if (shouldReloadStudents(classId)) {
        await getClassStudents({ classId, schoolYearId: selectedSchoolYearId, semesterId: activeSemester!.id })
      }
    },
    300,
    { maxWait: 1000 },
  )

  const loadClassStudents = useCallback(async (classId: string): Promise<void> => {
    try {
      await _debouncedLoadClassStudents(classId)
    }
    catch (error) {
      console.error('Failed to load class students:', error)
      throw error
    }
  }, [])

  const loadMoreStudents = useCallback(() => {
    setStudentPage(currentStudentPage + 1)
  }, [currentStudentPage, setStudentPage])

  useEffect(() => {
    if (currentClass?.id && user?.school.id) {
      const classId = currentClass.id

      if (shouldReloadStudents(classId)) {
        _debouncedLoadClassStudents(classId)
      }
    }

    return () => {
      _debouncedLoadClassStudents.cancel()
    }
  }, [
    currentStudentPage,
    currentClass?.id,
    user?.school.id,
  ])

  return {
    classes,
    students,
    isLoading,
    error,
    totalCount,
    totalStudentsCount,
    currentPage,
    currentStudentPage,
    itemsPerPage,
    studentsPerPage,
    hasNoClasses,
    currentClass,

    pagination,
    studentPagination,

    loadClasses,
    loadClassStudents,
    getClassById,
    setPage,
    setStudentPage,
    setItemsPerPage,
    setFilters,
    addClass,
    updateClass,
    deleteClass,
    loadMoreStudents,
    clearClasses,
    getClassBySlug,
    activateDeactivateClass,
    filterStudentWhereNotInTheClass,
    getClassDetailsStats: fetchClassDetailsStats,
  }
}
