// app/t/(schools)/(navigations)/teachers/_components/TeachersTable.tsx

'use client'

import type { ITeacherDTO, ITeacherQueryParams } from '@/types'
import { Pagination } from '@/components/Pagination'
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
import { getTeachers } from '@/services'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AssignClassesButton } from './AssignClassesButton'

export function TeachersTable({
  sort,
  page,
  limit,
  status,
  searchTerm,
  selectedClasses,
  selectedSubjects,
}: ITeacherQueryParams) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const [teachers, setTeachers] = useState<ITeacherDTO[]>([])
  const [totalCount, setTotalCount] = useState(0)

  const totalPages = Math.ceil((totalCount || 0) / limit!)

  async function fetchTeachers() {
    try {
      const { data, totalCount } = await getTeachers({
        sort,
        page,
        limit,
        status,
        searchTerm,
        selectedClasses,
        selectedSubjects,
      })

      setTeachers(data)
      setTotalCount(totalCount ?? 0)
    }
    catch {}
  }

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', `${field} ${direction}`)
    replace(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', newPage.toString())
    replace(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    fetchTeachers()
  }, [
    sort,
    page,
    limit,
    status,
    searchTerm,
    selectedClasses,
    selectedSubjects,
  ])

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                className="px-0 text-left font-normal hover:bg-background"
                onClick={() => handleSort('firstName', 'asc')}
              >
                Enseignant
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="px-0 text-left font-normal hover:bg-background"
                onClick={() => handleSort('email', 'asc')}
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
                {teacher.assignments?.filter(a => a.isMainTeacher).length}
                {(teacher.assignments ?? []).filter(a => a.isMainTeacher).length > 1
                  ? ' classes'
                  : ' classe'}
              </TableCell>
              <TableCell>
                <AssignClassesButton
                  teacherId={teacher.id}
                  teacherName={`${teacher.firstName} ${teacher.lastName}`}
                  currentAssignments={teacher.assignments ?? []}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination
        currentPage={page!}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </>
  )
}
