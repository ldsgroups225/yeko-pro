import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchClasses } from '@/services/classService'
import ClassesClient from './_components/ClassesClient'

const ITEMS_PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{
    grade?: string
    search?: string
    active?: string
    teacher?: string
    page?: string
  }>
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = params.page ? Number(params.page) : 1

  // Prepare filters for fetchClasses
  const fetchClassesParams = {
    page,
    limit: ITEMS_PER_PAGE,
    searchTerm: params.search,
    gradeId: params.grade,
    isActive: params.active === 'true' ? true : params.active === 'false' ? false : undefined,
    hasMainTeacher: params.teacher === 'true' ? true : params.teacher === 'false' ? false : undefined,
  }

  // Fetch grades and classes server-side
  const { classes, totalCount } = await fetchClasses(fetchClassesParams)
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="space-y-2 px-6 py-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Liste des classes</CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-3">
          <ClassesClient
            classes={classes}
            totalPages={totalPages}
            currentPage={page}
            searchParams={params}
          />
        </CardContent>
      </Card>
    </div>
  )
}
