import { getCandidatures, getDashboardMetrics, getPonctualiteData } from '@/services/dashboardService'
import { BatteryPlus, School, Users, UserX } from 'lucide-react'
import { Applications, Chart, GradesTable, MetricCard } from './_components'

export default async function DashboardPage() {
  const [metrics, ponctualite, candidatures] = await Promise.all([
    getDashboardMetrics(),
    getPonctualiteData(),
    getCandidatures(),
  ])

  return (
    <div className="py-4 px-6 space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Nombre d'élèves" icon={<Users className="h-6 w-6" />} variant="primary">
          <div className="text-3xl font-bold text-primary">{metrics?.studentPopulation.total || '-'}</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">▲ 15% vs année précédente</div>
        </MetricCard>

        <MetricCard title="Dossiers Élèves" icon={<UserX className="h-6 w-6" />} variant="destructive">
          <div className="space-y-2 text-destructive/80">
            <div className="flex justify-between items-center">
              <span className="text-sm">Candidatures en attente:</span>
              <span className="font-bold">{metrics?.studentFiles.pendingApplications || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sans parent lié:</span>
              <span className="font-bold">{metrics?.studentFiles.withoutParent || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sans classe:</span>
              <span className="font-bold">{metrics?.studentFiles.withoutClass || '-'}</span>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="Corps Enseignant" icon={<School className="h-6 w-6" />} variant="input">
          <div className="space-y-2 text-input/80">
            <div className="flex justify-between items-center">
              <span className="text-sm">Candidatures en attente:</span>
              <span className="font-bold">{metrics?.teachingStaff.pendingApplications || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sans classe assignée:</span>
              <span className="font-bold">{metrics?.teachingStaff.withoutClass || '-'}</span>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="Assiduité" icon={<BatteryPlus className="h-6 w-6" />} variant="success">
          <div className="space-y-2 text-emerald-600 dark:text-white">
            <div className="flex justify-between items-center">
              <span className="text-sm">Absences:</span>
              <span className="font-bold">{metrics?.attendance.absencesCount || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Retards:</span>
              <span className="font-bold">{metrics?.attendance.lateCount || '-'}</span>
            </div>
          </div>
        </MetricCard>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Chart data={ponctualite} />
        <Applications applications={candidatures} />
      </div>

      {/* Notes Section */}
      <GradesTable />
    </div>
  )
}
