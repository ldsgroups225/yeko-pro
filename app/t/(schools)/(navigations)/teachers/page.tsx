import type { ITeacherQueryParams } from '@/types'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import { FilterButton, InviteTeacherButton, TeachersFilters, TeachersTable, TeachersTableSkeleton } from './_components'

const ITEMS_PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Yeko | Professeurs',
  description: 'Gestion des professeurs de votre école',
}

export default async function TeachersPage({ searchParams: rawSearchParams }: {
  searchParams?: Promise<ITeacherQueryParams>
}) {
  const searchParams = await rawSearchParams

  const sort = searchParams?.sort || {
    column: 'last_name',
    direction: 'asc',
  }
  const page = Number(searchParams?.page) || 1
  const status = searchParams?.status || 'accepted'
  const searchTerm = searchParams?.searchTerm || ''
  const selectedClasses = searchParams?.selectedClasses || []
  const selectedSubjects = searchParams?.selectedSubjects || []
  const limit = Number(searchParams?.limit) || ITEMS_PER_PAGE

  return (
    <div className="px-6 py-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Liste des enseignants</CardTitle>

          <div className="flex items-center space-x-2">
            <InviteTeacherButton />

            <FilterButton />
          </div>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <TeachersFilters />

          <Suspense key={searchTerm + page} fallback={<TeachersTableSkeleton />}>
            <TeachersTable
              sort={sort}
              page={page}
              limit={limit}
              status={status}
              searchTerm={searchTerm}
              selectedClasses={selectedClasses}
              selectedSubjects={selectedSubjects}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
