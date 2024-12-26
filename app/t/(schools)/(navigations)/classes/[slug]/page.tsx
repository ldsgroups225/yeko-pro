'use client'

import type { ClassDetailsStudent, IClass, IClassDetailsStats } from '@/types/index'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClasses, useUser } from '@/hooks'
import { usePathname } from 'next/navigation'
import { useLayoutEffect, useState } from 'react'
import { ClassDetailsActions, ClassStudentTable, ClassTableSkeleton, MetricsCards, MetricsCardsSkeleton } from './_components'

export default function ClassDetailsPage() {
  const pathname = usePathname()
  const slug = pathname.split('/').pop()
  const { user } = useUser()
  const { getClassBySlug, isLoading, getClassDetailsStats, loadClassStudents, loadMoreStudents } = useClasses()

  // Component state
  const [classData, setClassData] = useState<IClass | null>(null)
  const [stats, setStats] = useState<IClassDetailsStats | null>(null)
  const [classStudents, setClassStudents] = useState<ClassDetailsStudent[]>([])

  useLayoutEffect(() => {
    async function getClassData(slug: string) {
      const classroom = await getClassBySlug(slug)
      if (classroom) {
        setClassData(classroom)

        const [classroomStats, classroomStudents] = await Promise.all([
          getClassDetailsStats({
            schoolId: user!.school.id,
            classId: classroom.id,
            // TODO: Add schoolYearId and semesterId
            // schoolYearId: classroom.schoolYearId,
            // semesterId: classroom.semesterId,
          }),
          loadClassStudents(
            user!.school.id,
            classroom.id,
          ),
        ])

        setStats(classroomStats)
        setClassStudents(classroomStudents)
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
            <section className="rounded-md border max-h-80 overflow-y-auto">
              {isLoading && <ClassTableSkeleton />}

              {(!isLoading && classStudents.length === 0) && <p>Empty</p>}

              {
                (!isLoading && classStudents.length !== 0) && (
                  <>
                    <ClassStudentTable classStudents={classStudents} />

                    <div className="w-full mx-auto mt-1 flex justify-center items-center">
                      <Button
                        variant="link"
                        onClick={() => loadMoreStudents()}
                      >
                        Charger plus
                      </Button>
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
