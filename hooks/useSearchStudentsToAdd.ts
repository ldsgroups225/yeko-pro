import type { FilterStudentWhereNotInTheClass } from '@/types'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
import { useStudentStore } from '@/store'
import useUserStore from '@/store/userStore'
import { useClasses } from './useClasses'

interface UseSearchStudentsToAddProps {
  classId: string
}

interface UseSearchStudentsToAddResult {
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
  debouncedSearch: string
  loading: boolean
  students: FilterStudentWhereNotInTheClass[]
  selectedStudents: FilterStudentWhereNotInTheClass[]
  handleSelect: (student: FilterStudentWhereNotInTheClass) => void
  handleRemove: (studentId: string) => void
  fetchStudents: (searchTerm: string) => Promise<void>
  handleSave: () => Promise<boolean>
  setSelectedStudents: React.Dispatch<React.SetStateAction<FilterStudentWhereNotInTheClass[]>>
}

export function useSearchStudentsToAdd({ classId }: UseSearchStudentsToAddProps): UseSearchStudentsToAddResult {
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<FilterStudentWhereNotInTheClass[]>([])
  const [selectedStudents, setSelectedStudents] = useState<FilterStudentWhereNotInTheClass[]>([])

  const { user } = useUserStore()
  const { bulkAddStudentsToClass } = useStudentStore()
  const { filterStudentWhereNotInTheClass, loadClassStudents, getClassDetailsStats } = useClasses()

  const fetchStudents = useCallback(async (searchTerm: string) => {
    if (!user?.school.id)
      return

    setLoading(true)
    try {
      const results = await filterStudentWhereNotInTheClass(
        user.school.id,
        classId,
        searchTerm,
      )
      setStudents(results)
    }
    catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Erreur lors de la recherche des élèves')
      setStudents([])
    }
    finally {
      setLoading(false)
    }
  }, [user?.school.id, classId, filterStudentWhereNotInTheClass])

  useEffect(() => {
    fetchStudents(debouncedSearch)
  }, [debouncedSearch, fetchStudents])

  const handleSave = useCallback(async () => {
    try {
      await bulkAddStudentsToClass(classId, selectedStudents.map(s => s.idNumber))
      await Promise.all([
        getClassDetailsStats({ classId, schoolId: user!.school.id }),
        loadClassStudents(user!.school.id, classId),
      ])
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1000)),
        {
          loading: 'Ajout des élèves en cours...',
          success: `${selectedStudents.length} élève(s) ajouté(s) avec succès`,
          error: 'Erreur lors de l\'ajout des élèves',
        },
      )
      setSelectedStudents([])

      return true
    }
    catch (error) {
      console.error(error)
      toast.error('Erreur lors de l\'ajout des élèves')
      return false
    }
  }, [selectedStudents])

  const handleSelect = useCallback((student: FilterStudentWhereNotInTheClass) => {
    setSelectedStudents(prev =>
      prev.some(s => s.idNumber === student.idNumber)
        ? prev
        : [...prev, student],
    )
  }, [])

  const handleRemove = useCallback((studentId: string) => {
    setSelectedStudents(prev => prev.filter(s => s.idNumber !== studentId))
  }, [])

  return {
    search,
    setSearch,
    debouncedSearch,
    loading,
    students,
    selectedStudents,
    handleSelect,
    handleRemove,
    fetchStudents,
    handleSave,
    setSelectedStudents,
  }
}
