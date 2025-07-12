import type { IClass } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRouter } from 'next/navigation'
import React from 'react'
import { ClassTableRowActions } from './ClassTableRowActions'

interface ClassesTableProps {
  classes?: IClass[]
  isLoading: boolean
  onClassEdit: (classroom: string) => void
}

/**
 * Component for displaying classes in a table view.
 *
 * @param {ClassesTableProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesTable: React.FC<ClassesTableProps> = ({
  classes,
  isLoading,
  onClassEdit,
}) => {
  const router = useRouter()

  function navigateToClass(slug: string) {
    router.push(`/t/classes/${slug}`)
  }

  const fakeClasses = Array.from({ length: 10 }).map((_, i) => ({
    id: i.toString(),
  }))

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N°</TableHead>
          <TableHead>Nom de la classe</TableHead>
          <TableHead>Nombre d'élèves</TableHead>
          <TableHead>Maximum d'élèves</TableHead>
          <TableHead>Enseignant principal</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? (
              <>
                {fakeClasses.map(el => (
                  <TableRow key={el.id}>
                    <TableCell>
                      <Skeleton className="h-4 w-[20px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <Skeleton className="h-7 w-[80px] rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-7 w-[100px] rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )
          : (
              classes?.map((cls, index) => (
                <TableRow key={cls.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{cls.name}</TableCell>
                  <TableCell>{cls.studentCount}</TableCell>
                  <TableCell>
                    <Badge
                      className="w-10 justify-center"
                      variant={cls.studentCount < cls.maxStudent ? 'success' : 'secondary'}
                    >
                      {cls.maxStudent}
                    </Badge>
                  </TableCell>
                  <TableCell>{cls.teacher?.fullName ?? '-'}</TableCell>
                  <TableCell className="flex justify-center">
                    <Badge variant={cls.isActive ? 'default' : 'destructive'}>
                      {cls.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ClassTableRowActions
                      editButtonClicked={() => onClassEdit(JSON.stringify(cls))}
                      navigateToClass={() => navigateToClass(cls.slug)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
      </TableBody>
    </Table>
  )
}
