import type { IStudentDTO } from '@/types'
import type { StudentFormValues } from '@/validations'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { MailIcon, Users } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'

import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import { cn, formatDate, formatPhoneNumber, getAge, getAvatarFromFullName } from '@/lib/utils'
import { useStudentStore } from '@/store'

import { EditStudentForm } from '../../classes/[slug]/_components/StudentTable/EditStudentForm'
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
  onStudentEdit: _onStudentEdit, // Prefix with _ to indicate it's intentionally unused
}) => {
  const router = useRouter()

  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<IStudentDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateStudent, error } = useStudentStore()

  const navigateToStudent = useCallback((slug: string) => {
    router.push(`/t/students/${slug}`)
  }, [router])

  const handleEditClick = useCallback((student: IStudentDTO) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }, [])

  const handleEditSubmit = async (values: StudentFormValues) => {
    if (!selectedStudent)
      return

    setIsSubmitting(true)
    try {
      const secondParent = values.secondParent?.fullName
        ? {
            id: '',
            fullName: values.secondParent.fullName!,
            phone: values.secondParent.phone!,
            gender: values.secondParent.gender!,
            type: values.secondParent.type!,
          }
        : undefined

      await updateStudent({
        id: selectedStudent.id,
        gender: values.gender,
        address: values.address,
        lastName: values.lastName,
        firstName: values.firstName,
        avatarUrl: values.avatarUrl,
        dateOfBirth: values.dateOfBirth?.toISOString(),
        secondParent,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Profil mis à jour avec succès')
      setShowEditModal(false)
    }
    catch (error) {
      console.error('Failed to update student:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCancel = () => {
    setShowEditModal(false)
    setSelectedStudent(null)
  }

  const fakeStudents = Array.from({ length: 10 }, (_, i) => ({
    id: i.toString(),
  }))

  // Show loading skeleton when loading
  if (isLoading) {
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
            <TableHead className="text-center">Affecté</TableHead>
            <TableHead className="text-center">Parent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fakeStudents.map(el => (
            <TableRow key={el.id}>
              {Array.from({ length: 9 }).map(() => (
                <TableCell key={nanoid()}>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  // Show empty state when no students
  if (!students || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          Aucun élève trouvé
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Aucun élève ne correspond aux critères de recherche actuels.
          Essayez de modifier vos filtres ou d'ajouter de nouveaux élèves.
        </p>
      </div>
    )
  }

  return (
    <>
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
            <TableHead className="text-center">Affecté</TableHead>
            <TableHead className="text-center">Parent</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow key={student.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="font-medium text-left">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatarUrl ?? ''} />
                    <AvatarFallback>
                      {student.firstName && student.lastName ? getAvatarFromFullName(`${student.firstName} ${student.lastName}`) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {student.lastName}
                </div>
              </TableCell>
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
                <Badge className="w-12 justify-center" variant={student.isGouvernentAffected ? 'default' : 'outline'}>
                  {student.isGouvernentAffected ? 'OUI' : 'NON'}
                </Badge>
              </TableCell>
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
                  editButtonClicked={() => handleEditClick(student)}
                  navigateToStudent={() => navigateToStudent(student.idNumber)}
                  linkToParent={() => onParentLink(student)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Student Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifier les informations de l&apos;élève. Cliquez sur enregistrer une fois terminé.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <EditStudentForm
              studentIdNumber={selectedStudent.idNumber}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
