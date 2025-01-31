'use client'

import { CreditCard, School, Users, UserX } from 'lucide-react'
import { Applications, Chart, GradesTable, MetricCard } from './_components'
import { candidatures, notes, ponctualiteData } from './_components/data'

export default function DashboardPage() {
  return (
    <div className="py-4 px-6 space-y-4">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Nombre d'élèves" icon={<Users className="h-6 w-6" />} variant="primary">
          <div className="text-3xl font-bold text-primary">3,469</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">▲ 15% vs année précédente</div>
        </MetricCard>

        <MetricCard title="Dossiers Élèves" icon={<UserX className="h-6 w-6" />} variant="destructive">
          <div className="space-y-2 text-destructive/80">
            <div className="flex justify-between items-center">
              <span className="text-sm">Candidatures en attente:</span>
              <span className="font-bold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sans parent lié:</span>
              <span className="font-bold">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sans classe:</span>
              <span className="font-bold">12</span>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="Corps Enseignant" icon={<School className="h-6 w-6" />} variant="input">
          <div className="space-y-2 text-input/80">
            <div className="flex justify-between items-center">
              <span className="text-sm">Candidatures en attente:</span>
              <span className="font-bold">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sans classe assignée:</span>
              <span className="font-bold">5</span>
            </div>
          </div>
        </MetricCard>

        <MetricCard title="Paiements Scolarité" icon={<CreditCard className="h-6 w-6" />} variant="success">
          <div className="text-3xl font-bold text-emerald-600 dark:text-white">92%</div>
          <div className="text-sm text-emerald-600 font-medium mt-2">
            ▲ 8% de paiements à temps vs mois dernier
          </div>
        </MetricCard>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Chart data={ponctualiteData} />
        <Applications applications={candidatures} />
      </div>

      {/* Notes Section */}
      <GradesTable notes={notes} />
    </div>
  )
}
