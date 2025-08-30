import { getEducatorStats, getPendingInscriptions, getRecentConducts } from '@/app/educator/actions'
import { DashboardStats } from './DashboardStats'
import { EducatorHeader } from './EducatorHeader'
import { EducatorTabs } from './EducatorTabs'
import { PendingInscriptionsCard } from './PendingInscriptionsCard'
import { RecentConductsCard } from './RecentConductsCard'

export default async function EducatorDashboard() {
  // Fetch data using cached functions
  const [stats, recentConducts, pendingInscriptions] = await Promise.all([
    getEducatorStats(),
    getRecentConducts(),
    getPendingInscriptions(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-background">
      <EducatorHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-primary">
              Tableau de Bord
            </h2>
            <p className="text-muted-foreground">
              Bienvenue dans votre espace éducateur
            </p>
          </div>

          <EducatorTabs conducts={recentConducts} inscriptions={pendingInscriptions}>
            <div className="space-y-8">
              <DashboardStats stats={stats} />
              <div className="grid gap-8 md:grid-cols-2">
                <RecentConductsCard conducts={recentConducts} />
                <PendingInscriptionsCard inscriptions={pendingInscriptions} />
              </div>
            </div>
          </EducatorTabs>
        </div>
      </main>
    </div>
  )
}
