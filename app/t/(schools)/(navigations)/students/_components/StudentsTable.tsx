import type { IStudentDTO } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatDate, formatPhoneNumber, getAge } from '@/lib/utils'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { StudentTableRowActions } from './StudentTableRowActions'

interface SortableHeaderProps {
  field: string
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  sort?: { field: string, direction: 'asc' | 'desc' }
  onSort: (field: string) => void
}

const SortableHeader: React.FC<SortableHeaderProps> = React.memo(({ field, children, align = 'left', sort, onSort }) => {
  const getSortIcon = useCallback(() => {
    if (sort?.field !== field)
      return <CaretSortIcon className="ml-2 h-4 w-4" />
    return (
      <CaretSortIcon
        className={`ml-2 h-4 w-4 transform ${
          sort.direction === 'desc' ? 'rotate-180' : ''
        }`}
      />
    )
  }, [sort, field])

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className={cn(
        'hover:bg-transparent px-0',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
      )}
    >
      {children}
      {getSortIcon()}
    </Button>
  )
})

interface StudentsTableProps {
  students?: IStudentDTO[]
  isLoading: boolean
  onStudentEdit: (student: IStudentDTO) => void
  sort?: { field: string, direction: 'asc' | 'desc' }
  onSort: (field: string) => void
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  students,
  isLoading,
  onStudentEdit,
  sort,
  onSort,
}) => {
  const router = useRouter()

  const navigateToStudent = useCallback((slug: string) => {
    router.push(`/t/students/${slug}`)
  }, [router])

  const fakeStudents = Array.from({ length: 10 }, (_, i) => ({
    id: i.toString(),
  }))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N°</TableHead>
          <TableHead>
            <SortableHeader field="lastName" sort={sort} onSort={onSort}>
              Nom
            </SortableHeader>
          </TableHead>
          <TableHead>
            <SortableHeader field="firstName" sort={sort} onSort={onSort}>
              Prénom
            </SortableHeader>
          </TableHead>
          <TableHead className="text-center">
            <SortableHeader field="idNumber" sort={sort} onSort={onSort}>
              Matricule
            </SortableHeader>
          </TableHead>
          <TableHead className="text-center">
            <SortableHeader field="gender" sort={sort} onSort={onSort}>
              Sexe
            </SortableHeader>
          </TableHead>
          <TableHead className="text-center">
            <SortableHeader field="dayOfBirth" sort={sort} onSort={onSort}>
              Age
            </SortableHeader>
          </TableHead>
          <TableHead className="text-center">Classe</TableHead>
          <TableHead className="text-center">Parent</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? (
              fakeStudents.map(el => (
                <TableRow key={el.id}>
                  {Array.from({ length: 9 }).map(() => (
                    <TableCell key={nanoid()}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )
          : (
              students?.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium text-left">{student.lastName}</TableCell>
                  <TableCell className="font-medium text-left">{student.firstName}</TableCell>
                  <TableCell className="font-medium text-center">{student.idNumber}</TableCell>
                  <TableCell className="text-center">{student.gender}</TableCell>
                  <TableCell className="text-center">
                    <Tooltip delayDuration={750}>
                      <TooltipTrigger>
                        <span>
                          {getAge(student.dateOfBirth)}
                          {' ans'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatDate(student.dateOfBirth)}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">{student.classroom?.name ?? '-'}</TableCell>
                  <TableCell className="text-center">
                    <Tooltip delayDuration={750}>
                      <TooltipTrigger>
                        <span>
                          {student.parent?.fullName ?? '-'}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {
                          student.parent?.phoneNumber
                            ? formatPhoneNumber(student.parent?.phoneNumber)
                            : '-'
                        }
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <StudentTableRowActions
                      editButtonClicked={() => onStudentEdit(student)}
                      navigateToStudent={() => navigateToStudent(student.idNumber)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
      </TableBody>
    </Table>
  )
}
