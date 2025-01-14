import type { IStudentDTO } from '@/types'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPhoneNumber, getAge } from '@/lib/utils'
import FemaleSign from '@/public/FemaleSign.svg'
import MaleSign from '@/public/MaleSign.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { StudentTableRowActions } from './StudentTableRowActions'

interface StudentsGridProps {
  students?: IStudentDTO[]
  isLoading: boolean
  onStudentEdit: (student: IStudentDTO) => void
}

export const StudentsGrid: React.FC<StudentsGridProps> = ({
  students,
  isLoading,
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {isLoading
        ? (
            fakeStudents.map(el => (
              <Skeleton key={el.id} className="h-80 rounded-md" />
            ))
          )
        : (
            students?.map(student => (
              <Card key={student.id} className="h-full">
                <CardHeader className="flex items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    {
                      student.gender === 'M'
                        ? (
                            <Image
                              priority
                              src={MaleSign}
                              alt="male student"
                            />
                          )
                        : (
                            <Image
                              priority
                              src={FemaleSign}
                              alt="female student"
                            />
                          )
                    }
                    <div>
                      <CardTitle className="text-lg font-semibold">{`${student.firstName} ${student.lastName}`}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Matricule:
                        {student.idNumber}
                      </p>
                    </div>
                  </div>
                  <StudentTableRowActions
                    editButtonClicked={() => onStudentEdit(student)}
                    navigateToStudent={() => navigateToStudent(student.idNumber)}
                  />
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm flex w-full justify-between items-center">
                    <span>Classe :</span>
                    <span className="font-medium">{student.classroom?.name ?? '-'}</span>
                  </p>

                  <p className="text-sm flex w-full justify-between items-center">
                    <span>Age :</span>
                    <span className="font-medium">
                      {getAge(student.dateOfBirth)}
                      {' '}
                      ans
                    </span>
                  </p>
                  <p className="text-sm flex w-full justify-between items-center">
                    <span>Téléphone :</span>
                    <span className="font-medium">{student.parent?.phoneNumber ? formatPhoneNumber(student.parent.phoneNumber) : '-'}</span>
                  </p>
                </CardContent>
              </Card>
            ))
          )}
    </div>
  )
}
