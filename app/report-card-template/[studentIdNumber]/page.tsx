// app/report-card-template/[studentIdNumber]/page.tsx

import ReportCardDisplay from '@/app/report-card/ReportCardDisplay'
import { getReportCardDataForStudent } from '@/services'
import { notFound } from 'next/navigation'

interface ReportCardTemplatePageProps {
  params: Promise<{
    studentIdNumber: string
    trimesterId?: string
  }>
}

export default async function ReportCardTemplatePage({ params }: ReportCardTemplatePageProps) {
  const { studentIdNumber, trimesterId } = await params

  // Optionnel : Vérification d'authentification explicite ici.
  // Normalement, le middleware devrait gérer cela.
  // Si vous décommentez, assurez-vous que les cookies sont bien transmis par Puppeteer.
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) {
  //   console.log("ReportCardTemplatePage: No user session, redirecting to login.");
  //   redirect('/sign-in');
  // }
  // console.log("ReportCardTemplatePage: User session found for user:", user?.id);

  if (!studentIdNumber) {
    notFound()
  }

  const reportData = await getReportCardDataForStudent(studentIdNumber, trimesterId)

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
