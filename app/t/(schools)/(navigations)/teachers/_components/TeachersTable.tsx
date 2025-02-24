import type { ITeacherDTO } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TeachersTableProps {
  teachers: ITeacherDTO[]
  isLoading: boolean
  onSort: (field: string, direction: 'asc' | 'desc') => void
}

export function TeachersTable({
  teachers,
  isLoading,
  onSort,
}: TeachersTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button
              variant="ghost"
              className="px-0 text-left font-normal hover:bg-background"
              onClick={() => onSort('firstName', 'asc')}
            >
              Enseignant
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant="ghost"
              className="px-0 text-left font-normal hover:bg-background"
              onClick={() => onSort('email', 'asc')}
            >
              Email
            </Button>
          </TableHead>
          <TableHead>Enseigne dans</TableHead>
          <TableHead>Prof principal de</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map(teacher => (
          <TableRow key={teacher.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={teacher.avatarUrl} />
                  <AvatarFallback>
                    {teacher.firstName ? teacher.firstName[0] : ''}
                    {teacher.lastName ? teacher.lastName[0] : ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {teacher.firstName}
                    {' '}
                    {teacher.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {teacher.phone}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>{teacher.email}</TableCell>
            <TableCell>
              <div>
                {(teacher.assignments ?? []).length}
                {(teacher.assignments ?? []).length > 1 ? ' classes' : ' classe'}
              </div>
            </TableCell>
            <TableCell>
              {/* Add action buttons here */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
