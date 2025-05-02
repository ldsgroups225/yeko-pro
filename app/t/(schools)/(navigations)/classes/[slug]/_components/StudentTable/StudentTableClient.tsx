'use client'

import type { ClassDetailsStudent } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getClassStudents } from '@/services/classService'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { StudentRow } from './StudentRow'
import { TablePagination } from './TablePagination'
import { TableSkeleton } from './TableSkeleton'

interface StudentTableClientProps {
  initialStudents: ClassDetailsStudent[]
  totalCount: number
  classId: string
  schoolYearId: number
  semesterId: number
  itemsPerPage: number
}

export function StudentTableClient({
  initialStudents,
  totalCount,
  classId,
  schoolYearId,
  semesterId,
  itemsPerPage,
}: StudentTableClientProps) {
  const [students, setStudents] = useState<ClassDetailsStudent[]>(initialStudents)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const pagination = {
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }

  const handleSelectAll = useCallback(() => {
    setSelectedStudents(prev =>
      prev.length === students.length ? [] : students.map(s => s.id),
    )
  }, [students])

  const handleSelectStudent = useCallback((studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId],
    )
  }, [])

  const handlePageChange = useCallback(async (newPage: number) => {
    if (newPage === currentPage)
      return
    setIsLoading(true)
    try {
      // Fetch data for the new page client-side
      const { students: newStudents } = await getClassStudents({
        classId,
        schoolYearId,
        semesterId,
        page: newPage,
        limit: itemsPerPage,
      })
      setStudents(newStudents)
      setCurrentPage(newPage)
      setSelectedStudents([]) // Clear selection on page change
    }
    catch (error) {
      console.error('Failed to fetch students for page:', newPage, error)
      toast.error('Erreur lors du chargement des élèves.')
    }
    finally {
      setIsLoading(false)
    }
  }, [currentPage, classId, schoolYearId, semesterId, itemsPerPage])

  return (
    <>
      {isLoading
        ? (
            <TableSkeleton />
          )
        : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={students.length > 0 && selectedStudents.length === students.length}
                        onCheckedChange={handleSelectAll}
                        disabled={students.length === 0}
                      />
                    </TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Moyenne</TableHead>
                    <TableHead>Rang</TableHead>
                    <TableHead>Absences</TableHead>
                    <TableHead>Retards</TableHead>
                    <TableHead>Dernière Éval.</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">
                            Aucun élève dans cette classe pour le moment.
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        students.map(student => (
                          <StudentRow
                            key={student.id}
                            student={student}
                            onSelect={handleSelectStudent}
                            classId={classId}
                            isSelected={selectedStudents.includes(student.id)}
                          />
                        ))
                      )}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <TablePagination
                  total={totalCount}
                  currentPage={currentPage}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
    </>
  )
}
