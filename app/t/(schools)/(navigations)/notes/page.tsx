import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getClassesForNotes } from '@/services/noteService'
import { NotesFilters, NotesTable, NotesTableSkeleton } from './_components'

export const metadata: Metadata = {
  title: 'Yeko | Notes',
  description: 'Gestion des notes des élèves',
}

interface NotesPageProps {
  searchParams: Promise<{
    classId?: string
    subjectId?: string
    semesterId?: string
    noteType?: string
    searchTerm?: string
  }>
}

async function getInitialData() {
  const [classes] = await Promise.all([
    getClassesForNotes(),
    // getSubjects(),
    // getSemesters(),
  ])

  return {
    classes,
  }
}

export default async function NotesPage({
  searchParams,
}: NotesPageProps) {
  const initialData = await getInitialData()
  const resolvedParams = await searchParams

  return (
    <div className="px-6 py-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Gestion des Notes</CardTitle>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <NotesFilters
            classes={initialData.classes}
          />

          <Suspense fallback={<NotesTableSkeleton />}>
            <NotesTable searchParams={resolvedParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
