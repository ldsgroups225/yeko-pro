import type { IStudentDTO } from '@/types'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
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
import { cn, formatDate, formatPhoneNumber, getAge, getAvatarFromFullName } from '@/lib/utils'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { MailIcon } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { StudentTableRowActions } from './StudentTableRowActions'

interface SortableHeaderProps {
  field: string
  children: React.ReactNode
  onSort: (field: string) => void
  align?: 'left' | 'center' | 'right'
  sort?: { field: string, direction: 'asc' | 'desc' }
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
  onParentLink: (student: IStudentDTO) => void
  onStudentEdit: (student: IStudentDTO) => void
  sort?: { field: string, direction: 'asc' | 'desc' }
  onSort: (field: string) => void
}

export const StudentsTable: React.FC<StudentsTableProps> = ({
  sort,
  onSort,
  students,
  isLoading,
  onParentLink,
  onStudentEdit,
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
                    {
                      student.dateOfBirth
                        ? (
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
                          )
                        : '-'
                    }
                  </TableCell>
                  <TableCell className="text-center">{student.classroom?.name ?? '-'}</TableCell>
                  <TableCell className="text-center">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost">{student.parent?.fullName ?? '-'}</Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            <AvatarImage src={student.parent?.avatarUrl ?? ''} />
                            <AvatarFallback>
                              {student.parent?.fullName ? getAvatarFromFullName(student.parent?.fullName) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{student.parent?.fullName ?? '-'}</h4>
                            <p className="text-sm">
                              {
                                student.parent?.phoneNumber
                                  ? formatPhoneNumber(student.parent?.phoneNumber)
                                  : '-'
                              }
                            </p>
                            <div className="flex items-center pt-2">
                              <MailIcon className="mr-2 h-4 w-4 opacity-70" />
                              {' '}
                              <span className="text-xs text-muted-foreground">
                                {student.parent?.email ?? '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <StudentTableRowActions
                      editButtonClicked={() => onStudentEdit(student)}
                      navigateToStudent={() => navigateToStudent(student.idNumber)}
                      linkToParent={() => onParentLink(student)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
      </TableBody>
    </Table>
  )
}
