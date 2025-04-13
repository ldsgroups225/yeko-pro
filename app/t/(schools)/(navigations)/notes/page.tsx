import type { Metadata } from 'next'
import type { NotesQueryParams } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClasses, getCurrentSchoolYear, getSemesters, getSubjects } from '@/services/noteService'
import { Suspense } from 'react'
import { NotesFilters, NotesTable, NotesTableSkeleton } from './_components'

export const metadata: Metadata = {
  title: 'Yeko | Notes',
  description: 'Gestion des notes des élèves',
}

export default async function NotesPage({
  searchParams: rawSearchParams,
}: {
  searchParams?: Promise<NotesQueryParams>
}) {
  const [searchParams, currentSchoolYear, classes, subjects, semesters] = await Promise.all([
    rawSearchParams,
    getCurrentSchoolYear(),
    getClasses(),
    getSubjects(),
    getSemesters(),
  ])

  const params = {
    ...searchParams,
    noteType: searchParams?.noteType,
    schoolYearId: currentSchoolYear?.id?.toString(),
  }

  return (
    <div className="px-6 py-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Gestion des Notes</CardTitle>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <Suspense>
            <NotesFilters
              classes={classes}
              subjects={subjects}
              semesters={semesters}
            />
          </Suspense>

          <Suspense fallback={<NotesTableSkeleton />}>
            <NotesTable searchParams={params} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
