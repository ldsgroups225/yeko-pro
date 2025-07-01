// app/report-card-template/[studentIdNumber]/page.tsx

import ReportCardDisplay from '@/app/report-card/ReportCardDisplay'
import { getReportCardDataForStudent } from '@/services'
import { notFound } from 'next/navigation'

interface ReportCardTemplatePageProps {
  params: Promise<{
    studentIdNumber: string
    semesterId?: string
  }>
}

export default async function ReportCardTemplatePage({ params }: ReportCardTemplatePageProps) {
  const { studentIdNumber, semesterId } = await params

  if (!studentIdNumber) {
    notFound()
  }

  const reportData = await getReportCardDataForStudent(studentIdNumber, semesterId)

  if (!reportData) {
    console.error(`ReportCardTemplatePage: No report data found for student ${studentIdNumber}`)
    return (
      <div>
        Impossible de charger les données du bulletin pour l'élève
        {studentIdNumber}
        .
      </div>
    )
  }

  return (
    <main>
      <ReportCardDisplay data={reportData} />
    </main>
  )
}
