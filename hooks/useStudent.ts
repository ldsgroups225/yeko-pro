import type { IStudentDTO } from '../types'
import { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { StudentService } from '../services/studentService'
import useStudentStore from '../store/studentStore'
import { useUser } from './useUser'

interface ClassDetailsStudent extends IStudentDTO {
  gradeAverage: number
  lateCount: number
  absentCount: number
}

interface UseStudentsResult {
  students: IStudentDTO[] | undefined
  isLoading: boolean
  error: string | null
  totalCount: number | undefined
  totalStudentsCount: number | undefined
  currentPage: number
  currentStudentPage: number
  itemsPerPage: number
  studentsPerPage: number
  hasNoStudents: boolean
  currentStudent: IStudentDTO | null
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

  loadStudents: (params: { schoolId: string }) => Promise<void>
  loadStudentsByClass: (schoolId: string, classId: string) => Promise<ClassDetailsStudent[]>
  getStudentById: (studentId: string) => IStudentDTO | undefined
  setPage: (page: number) => void
  setStudentPage: (page: number) => void
  setItemsPerPage: (count: number) => void
  setFilters: (filters: {
    gradeId?: string
    isActive?: boolean
    searchTerm?: string
  }) => void
  addStudent: (params: { name: string, schoolId: string, gradeId: number }) => Promise<void>
  updateStudent: (params: { id: string, name: string, gradeId: number }) => Promise<void>
  deleteStudent: (studentId: string) => Promise<void>
  loadMoreStudents: () => void
  clearStudents: () => void
}

/**
 * Custom hook to interact with the student store.
 * Provides pagination, filtering, and data access functionality.
 *
 * @returns {UseStudentsResult} Object containing student-related functions and data
 */
export function useStudent(): UseStudentsResult {
  const { user } = useUser()
  const studentService = StudentService.getInstance()

  const {
    students,
    isLoading,
    error,
    totalCount,
    fetchStudents,
    updateStudent: storeUpdateStudent,
    deleteStudent: storeDeleteStudent,
    selectedStudent,
    setIsLoading,
  } = useStudentStore()

  const hasNoStudents = students?.length === 0

  const totalPages = Math.ceil((totalCount || 0) / 10) // Assuming default itemsPerPage is 10
  const hasNextPage = false
  const hasPreviousPage = false

  const loadStudents = async (params: { schoolId: string }): Promise<void> => {
    setIsLoading(true)
    try {
      await fetchStudents(params)
    }
    catch (e: any) {
      console.error('Failed to load students:', e.message)
    }
    finally {
      setIsLoading(false)
    }
  }

  const _debouncedLoadStudentsByClass = useDebouncedCallback(
    async (schoolId: string, classId: string) => {
      try {
        await studentService.getStudents({ schoolId, selectedClasses: [classId] })
        // Handle the studentsData appropriately, maybe update the store
      }
      catch (error: any) {
        console.error('Failed to load students by class:', error.message)
      }
    },
    0,
  )

  useEffect(() => {
    if (user?.school?.id) {
      loadStudents({ schoolId: user.school.id })
    }
  }, [user?.school?.id, loadStudents])

  const loadMoreStudents = () => {
    // Implementation to load more students
  }

  const totalStudentPages = 0
  const hasNextStudentPage = false
  const hasPreviousStudentPage = false

  const loadStudentsByClass = async (
    schoolId: string,
    classId: string,
  ): Promise<ClassDetailsStudent[]> => {
    try {
      const { data } = await studentService.getStudents({ schoolId, selectedClasses: [classId] })
      return (data || []).map(student => ({
        ...student,
        gradeAverage: 0, // Replace with actual logic if available
        lateCount: 0, // Replace with actual logic if available
        absentCount: 0, // Replace with actual logic if available
      }))
    }
    catch (error: any) {
      console.error('Failed to load students by class:', error.message)
      return []
    }
  }

  const addStudent = async (
    _params: { name: string, schoolId: string, gradeId: number },
  ): Promise<void> => {
    try {
      // Assuming store has a method to add student
      // await storeAddStudent(params);
    }
    catch (error: any) {
      console.error('Failed to add student:', error.message)
    }
  }

  const updateStudent = async (
    params: { id: string, name: string, gradeId: number },
  ): Promise<void> => {
    try {
      await storeUpdateStudent(params)
    }
    catch (error: any) {
      console.error('Failed to update student:', error.message)
    }
  }

  const deleteStudent = async (studentId: string): Promise<void> => {
    try {
      await storeDeleteStudent(studentId)
    }
    catch (error: any) {
      console.error('Failed to delete student:', error.message)
    }
  }

  const getStudentById = (studentId: string) => {
    return students?.find(student => student.id === studentId)
  }

  return {
    students: students ?? [],
    isLoading,
    error: error?.message || null,
    totalCount: totalCount || 0,
    totalStudentsCount: totalCount || 0,
    currentPage: 1,
    currentStudentPage: 1,
    itemsPerPage: 10,
    studentsPerPage: 10,
    hasNoStudents,
    currentStudent: selectedStudent || null,
    pagination: {
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    studentPagination: {
      totalPages: totalStudentPages,
      hasNextPage: hasNextStudentPage,
      hasPreviousPage: hasPreviousStudentPage,
    },
    loadStudents,
    loadStudentsByClass,
    getStudentById,
    setPage: () => {},
    setStudentPage: () => {},
    setItemsPerPage: () => {},
    setFilters: () => {},
    addStudent,
    updateStudent,
    deleteStudent,
    loadMoreStudents,
    clearStudents: () => {},
  }
}
