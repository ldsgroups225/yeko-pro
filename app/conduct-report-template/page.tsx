// app/conduct-report-template/page.tsx

import { Suspense } from 'react'
import ConductReportDisplay from './ConductReportDisplay'

interface ConductReportTemplatePageProps {
  searchParams: Promise<{
    classId?: string
    gradeFilter?: string
    schoolYearId?: string
    semesterId?: string
  }>
}

export default async function ConductReportTemplatePage({
  searchParams,
}: ConductReportTemplatePageProps) {
  const params = await searchParams

  return (
    <main>
      <Suspense fallback={<div>Chargement du rapport de conduite...</div>}>
        <ConductReportDisplay
          classId={params.classId}
          gradeFilter={params.gradeFilter as any}
          schoolYearId={params.schoolYearId}
          semesterId={params.semesterId}
        />
      </Suspense>
    </main>
  )
}
