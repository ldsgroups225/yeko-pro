'use client'

import type { ClassDetailsStudent } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCallback, useState } from 'react'
import { StudentRow } from './StudentRow'
import { TablePagination } from './TablePagination'

interface StudentTableClientProps {
  initialStudents: ClassDetailsStudent[]
  totalCount: number
  classId: string
  itemsPerPage: number
}

export function StudentTableClient({
  initialStudents,
  totalCount,
  classId,
  itemsPerPage,
}: StudentTableClientProps) {
  const [students] = useState<ClassDetailsStudent[]>(initialStudents)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [currentPage] = useState(1)

  const totalPages = Math.ceil(totalCount / itemsPerPage)

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

  return (
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
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
