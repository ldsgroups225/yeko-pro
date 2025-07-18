import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchGrades } from '@/services/gradeService'
import { fetchSchoolYears } from '@/services/schoolYearService'
import { fetchSubjects } from '@/services/subjectService'
import { fetchUserProfile } from '@/services/userService'
import { ProgressReportFilters } from './_components/ProgressReportFilters'
import { ProgressReportTable } from './_components/ProgressReportTable'
import { ProgressReportTableSkeleton } from './_components/ProgressReportTableSkeleton'

export const metadata: Metadata = {
  title: 'Yeko | Suivi Pédagogique',
  description: 'Suivi de l\'avancement des leçons par matière et par classe.',
}

interface PageProps {
  searchParams: Promise<{
    gradeId?: string
    subjectId?: string
    schoolYearId?: string
    isCompleted?: string
    page?: string
  }>
}

export default async function ProgressReportsPage({ searchParams }: PageProps) {
  const params = await searchParams

  const page = Number(params.page ?? 1)
  const limit = 10

  const user = await fetchUserProfile()

  const [grades, subjects, schoolYears] = await Promise.all([
    fetchGrades(user.school.cycleId),
    fetchSubjects(),
    fetchSchoolYears(),
  ])

  const currentSchoolYear = schoolYears.find(sy => sy.isCurrent === true)

  const filters = {
    gradeId: params.gradeId ? Number(params.gradeId) : undefined,
    subjectId: params.subjectId,
    schoolYearId: params.schoolYearId ? Number(params.schoolYearId) : currentSchoolYear?.id,
    isCompleted: params.isCompleted === 'true' ? true : params.isCompleted === 'false' ? false : undefined,
  }

  const suspenseKey = JSON.stringify({ ...filters, page })

  return (
    <div className="space-y-4 p-6">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Suivi de l'avancement des leçons par matière et par classe</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressReportFilters
            grades={grades}
            subjects={subjects}
            schoolYears={schoolYears}
            initialFilters={filters}
          />
          <Suspense key={suspenseKey} fallback={<ProgressReportTableSkeleton />}>
            <ProgressReportTable
              filters={filters}
              page={page}
              limit={limit}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
