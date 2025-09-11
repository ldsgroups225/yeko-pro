import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createAuthorizationService } from '@/lib/services/authorizationService'
import { getClassesForNotes } from '@/services/noteService'
import { ERole } from '@/types'
import { NotesFilters, NotesTable, NotesTableSkeleton } from './_components'
import { NotesExportButton } from './_components/NotesExportButton'

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
  const authorizationService = await createAuthorizationService()

  const userId = await authorizationService.getAuthenticatedUserId()
  const schoolInfo = await authorizationService.getUserSchoolInfo(userId, {
    roleId: ERole.DIRECTOR,
    includeRoleName: false,
    withSchoolYear: true,
  })

  const [classes] = await Promise.all([
    getClassesForNotes({ schoolId: schoolInfo.id }),
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
          <NotesExportButton />
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
