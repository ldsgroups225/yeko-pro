'use client'

import type { IClass, IClassDetailsStats } from '@/types'
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { useClasses, useGrade, useUser } from '@/hooks'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ClassCreationOrUpdateDialog } from '../_components'
import { MetricsCards, MetricsCardsSkeleton, StudentTable, StudentTableHeader, TableSkeleton } from './_components'

export default function ClassDetailsPage() {
  const pathname = usePathname()
  const slug = useMemo(() => pathname.split('/').pop(), [pathname])

  const { user } = useUser()
  const { grades } = useGrade()

  const [isLoading, setIsLoading] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [classData, setClassData] = useState<IClass | null>(null)
  const [stats, setStats] = useState<IClassDetailsStats | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const {
    students,
    getClassBySlug,
    setStudentPage,
    loadMoreStudents,
    loadClassStudents,
    studentPagination,
    currentStudentPage,
    getClassDetailsStats,
  } = useClasses()

  const getClassData = useCallback(async (slugParam: string) => {
    const classroom = await getClassBySlug(slugParam)
    if (classroom) {
      setClassData(classroom)

      if (!user)
        return

      const [classroomStats] = await Promise.all([
        getClassDetailsStats({
          classId: classroom.id,
          schoolId: user.school.id,
        }),

        loadClassStudents(user.school.id, classroom.id),
      ])

      setStats(classroomStats)
    }
  }, [])

  useEffect(() => {
    if (slug) {
      getClassData(slug)
        .catch((error) => {
          console.error('Failed to fetch class data:', error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [])

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

  const handlePageChange = (newPage: number) => {
    if (newPage > currentStudentPage) {
      loadMoreStudents()
    }
    setStudentPage(newPage)
  }

  return (
    <div className="space-y-3 p-6">
      {isLoading
        ? (
            <>
              <MetricsCardsSkeleton />
              <TableSkeleton />
            </>
          )
        : (
            <>
              <MetricsCards stats={stats} />
              <Card>
                <CardHeader>
                  <StudentTableHeader
                    classData={classData}
                    onOpenClassEditionModal={() => setShowClassModal(true)}
                  />
                </CardHeader>
                <CardContent>
                  <StudentTable
                    students={students}
                    selectedStudents={selectedStudents}
                    onSelectAll={handleSelectAll}
                    onSelectStudent={handleSelectStudent}
                    onPageChange={handlePageChange}
                    pagination={studentPagination}
                    currentPage={currentStudentPage}
                  />
                </CardContent>
              </Card>
            </>
          )}

      {/* Modals */}
      {showClassModal && (
        <ClassCreationOrUpdateDialog
          open={showClassModal}
          oldClass={
            classData
              ? {
                  id: classData.id,
                  name: classData.name,
                  gradeId: classData.gradeId,
                  maxStudent: classData.maxStudent,
                }
              : undefined
          }
          onOpenChange={setShowClassModal}
          gradeOptions={grades ?? []}
        />
      )}
    </div>
  )
}
