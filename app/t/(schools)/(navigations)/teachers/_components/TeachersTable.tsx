import type { ITeacherDTO } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  onStatusChange: (teacherId: string, status: 'pending' | 'accepted' | 'rejected') => void
}

export function TeachersTable({
  teachers,
  isLoading,
  onSort,
  onStatusChange,
}: TeachersTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
          <TableHead>Status</TableHead>
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
              <Badge variant="secondary">
                {(teacher.assignments ?? []).filter(assignment => assignment.isMainTeacher).length}
                {(teacher.assignments ?? []).filter(assignment => assignment.isMainTeacher).length > 1 ? ' classes' : ' classe'}
              </Badge>
            </TableCell>
            <TableCell>
              <Select
                value={teacher.status}
                onValueChange={value =>
                  onStatusChange(teacher.id, value as 'pending' | 'accepted' | 'rejected')}
              >
                <SelectTrigger className="w-32">
                  <SelectValue>
                    <Badge className={getStatusColor(teacher.status)}>
                      {teacher.status === 'accepted' && 'Accepté'}
                      {teacher.status === 'pending' && 'En attente'}
                      {teacher.status === 'rejected' && 'Rejeté'}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="rejected">Rejeté</SelectItem>
                </SelectContent>
              </Select>
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
