import { getClassStudents } from '@/services/classService'
import { StudentTableClient } from './StudentTable/StudentTableClient'

const ITEMS_PER_PAGE = 10 // Or fetch from config/constants

interface StudentTableLoaderProps {
  classId: string
  schoolId: string
}

// This is an async Server Component
export async function StudentTableLoader({ classId, schoolId }: StudentTableLoaderProps) {
  // TODO: Fetch schoolYearId and semesterId server-side
  const schoolYearId = 1 // Placeholder
  const semesterId = 1 // Placeholder

  const { students: initialStudents, totalCount } = await getClassStudents({
    classId,
    schoolId,
    schoolYearId,
    semesterId,
    page: 1, // Fetch first page server-side
    limit: ITEMS_PER_PAGE,
  })

  return (
    <StudentTableClient
      initialStudents={initialStudents}
      totalCount={totalCount}
      classId={classId}
      schoolId={schoolId}
      schoolYearId={schoolYearId}
      semesterId={semesterId}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  )
}
