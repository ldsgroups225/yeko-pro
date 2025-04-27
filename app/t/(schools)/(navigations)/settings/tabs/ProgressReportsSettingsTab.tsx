'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGrade, useSchoolYear, useUser } from '@/hooks'
import { useSubject } from '@/hooks/useSubject'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ProgressReportActions,
  ProgressReportFilters,
  ProgressReportTable,
  ProgressReportTableSkeleton,
} from '../components/ProgressReport'

interface Filters {
  /** Sélectionné depuis ?gradeId=… */
  gradeId?: number
  /** Sélectionné depuis ?subjectId=… */
  subjectId?: string
  /** Soit depuis ?schoolYearId=…, soit la valeur par défaut */
  schoolYearId?: number
  // /** true/false ou indéfini si absent */
  // isCompleted?: boolean
}

function ProgressReportsSettingsTab() {
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get('page') ?? 1)
  const limit = 10

  const { user } = useUser()
  const { grades } = useGrade()
  const { subjects } = useSubject()
  const { selectedSchoolYearId } = useSchoolYear()

  const [filters, setFilters] = useState<Filters>({})
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setFilters({
        gradeId: searchParams?.get('gradeId') ? Number(searchParams.get('gradeId')) : undefined,
        subjectId: searchParams?.get('subjectId') || undefined,
        schoolYearId: searchParams?.get('schoolYearId')
          ? Number(searchParams.get('schoolYearId'))
          : selectedSchoolYearId,
        // isCompleted: searchParams?.get('isCompleted') === 'true'
        //   ? true
        //   : searchParams?.get('isCompleted') === 'false'
        //     ? false
        //     : undefined,
      })

      setLoading(false)
    }
    catch (error) {
      console.error('Failed to load data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user)
      return

    loadData()
  }, [searchParams])

  if (loading || !user) {
    return <ProgressReportTableSkeleton />
  }

  return (
    <div className="space-y-4 p-6">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Configuration de la Suivie des cours</CardTitle>
          <ProgressReportActions
            grades={grades}
            subjects={subjects}
            schoolYearId={selectedSchoolYearId}
            refresh={async () => await loadData()}
          />
        </CardHeader>
        <CardContent>
          <ProgressReportFilters
            grades={grades}
            subjects={subjects}
            initialFilters={filters}
          />

          {loading
            ? (
                <ProgressReportTableSkeleton />
              )
            : (
                <ProgressReportTable
                  schoolId={user.school.id}
                  filters={{ ...filters, schoolYearId: filters.schoolYearId as number }}
                  page={page}
                  limit={limit}
                  refresh={async () => await loadData()}
                />
              )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProgressReportsSettingsTab
