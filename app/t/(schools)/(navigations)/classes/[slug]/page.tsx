'use client'

import type { IClass, IClassDetailsStats } from '@/types/index'
import { Pagination } from '@/components/Pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClasses, useSchoolYear, useUser } from '@/hooks'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClassDetailsActions, ClassStudentTable, ClassTableSkeleton, MetricsCards, MetricsCardsSkeleton } from './_components'

export default function ClassDetailsPage() {
  const pathname = usePathname()
  const slug = pathname.split('/').pop()
  const { user } = useUser()
  const {
    students: classStudents,
    isLoading,
    getClassBySlug,
    getClassDetailsStats,
    loadClassStudents,
    currentStudentPage,
    studentPagination,
    loadMoreStudents,
    setStudentPage,
  } = useClasses()

  // Component state
  const { selectedSchoolYearId } = useSchoolYear()
  const [classData, setClassData] = useState<IClass | null>(null)
  const [stats, setStats] = useState<IClassDetailsStats | null>(null)

  const handlePageChange = (newPage: number) => {
    if (newPage > currentStudentPage) {
      loadMoreStudents()
    }
    setStudentPage(newPage)
  }

  useEffect(() => {
    async function getClassData(slug: string) {
      const classroom = await getClassBySlug(slug)
      if (classroom) {
        setClassData(classroom)

        const [classroomStats] = await Promise.all([
          getClassDetailsStats({
            schoolId: user!.school.id,
            classId: classroom.id,
            schoolYearId: selectedSchoolYearId,
            // TODO: Add schoolYearId and semesterId
            // semesterId: classroom.semesterId,
          }),
          loadClassStudents(
            user!.school.id,
            classroom.id,
          ),
        ])

        setStats(classroomStats)
      }
    }

    if (slug) {
      getClassData(slug).catch((error) => {
        console.error('Failed to fetch class data:', error)
      })
    }
  }, [slug])

  return (
    <div className="space-y-2 px-6 py-2">
      {/* Main Card */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>
            Details de la
            {' '}
            <span className="text-primary">{pathname.split('/').pop()}</span>
          </CardTitle>
          <ClassDetailsActions />

        </CardHeader>

        <CardContent className="px-6 py-3">
          <div className="overflow-x-auto whitespace-pre-wrap">
            {/* Statistics Grid */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
              {isLoading && <MetricsCardsSkeleton />}
              {
                (!isLoading && stats) && (
                  <MetricsCards studentCount={classData?.studentCount || 0} stats={stats} />
                )
              }
            </section>

            {/* Students Table */}
            <section className="scrollable-div rounded-md border max-h-80 overflow-y-auto">
              {isLoading && <ClassTableSkeleton />}

              {(!isLoading && classStudents.length === 0) && <p>Empty</p>}

              {
                (!isLoading && classStudents.length !== 0) && (
                  <>
                    <ClassStudentTable classStudents={classStudents} />

                    <div className="w-full mt-1 flex justify-center items-center">
                      <Pagination
                        currentPage={currentStudentPage}
                        totalPages={!isLoading ? studentPagination.totalPages : studentPagination.totalPages + 1}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  </>
                )
              }
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
