import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getClassBySlug } from '@/services/classService'
import { fetchGrades } from '@/services/gradeService'
import { fetchUserProfile } from '@/services/userService'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import {
  MetricsCardsLoader,
  MetricsCardsSkeleton,
  StudentTableHeaderClient,
  StudentTableLoader,
  TableSkeleton,
} from './_components'

// Make the page component async
export default async function ClassDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Await the params object before using it
  const { slug } = await params

  // Fetch essential data server-side in parallel
  const [classDataResult, gradesResult, userResult] = await Promise.allSettled([
    getClassBySlug(slug),
    fetchGrades('secondary'),
    fetchUserProfile(),
  ])

  // Handle failed essential data fetches
  if (classDataResult.status === 'rejected') {
    console.error('Failed to fetch class data:', classDataResult.reason as Error)
    notFound()
  }
  if (userResult.status === 'rejected') {
    console.error('Failed to fetch user profile:', userResult.reason as Error)
    throw new Error('User profile not found or unauthorized.')
  }
  if (gradesResult.status === 'rejected') {
    console.error('Failed to fetch grades:', gradesResult.reason as Error)
  }

  const classData = classDataResult.value
  const grades = gradesResult.status === 'fulfilled' ? gradesResult.value : []
  const user = userResult.value

  return (
    <div className="space-y-3 p-6">
      {/* Metrics Cards - Deferred with Suspense */}
      <Suspense fallback={<MetricsCardsSkeleton />}>
        <MetricsCardsLoader classId={classData.id} schoolId={user.school.id} />
      </Suspense>

      {/* Student Table - Deferred with Suspense */}
      <Suspense fallback={<TableSkeleton />}>
        <Card>
          <CardHeader>
            {/* Header needs client interactivity for the modal */}
            <StudentTableHeaderClient classData={classData} grades={grades} />
          </CardHeader>
          <CardContent>
            <StudentTableLoader classId={classData.id} />
          </CardContent>
        </Card>
      </Suspense>
    </div>
  )
}
