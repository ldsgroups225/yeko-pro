import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StudentRow } from './StudentRow'
import { TablePagination } from './TablePagination'

interface StudentTableProps {
  students: any[]
  selectedStudents: string[]
  onSelectAll: () => void
  onSelectStudent: (id: string) => void
  onPageChange: (page: number) => void
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  currentPage: number
}

export function StudentTable({
  students,
  selectedStudents,
  onSelectAll,
  onSelectStudent,
  onPageChange,
  pagination,
  currentPage,
}: StudentTableProps) {
  if (students.length === 0)
    return <p>Empty</p>

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedStudents.length === students.length}
                onCheckedChange={onSelectAll}
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
          {students.map(student => (
            <StudentRow
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onSelect={onSelectStudent}
            />
          ))}
        </TableBody>
      </Table>
      <TablePagination
        total={students.length}
        currentPage={currentPage}
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </>
  )
}
