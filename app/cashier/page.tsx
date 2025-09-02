import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardStats } from './_components/DashboardStats'
import { EndOfDayReport } from './_components/EndOfDayReport'
import { RecentTransactions } from './_components/RecentTransactions'

export default function CashierPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {/* <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bienvenue sur votre Tableau de Bord
        </h1>
        <p className="text-muted-foreground">
          Gérez les paiements et transactions des étudiants en toute simplicité
        </p>
      </div> */}

      {/* Dashboard Stats */}
      <Suspense fallback={(
        <Card
          className="border-border/30 shadow-glass bg-card/25 backdrop-blur-lg"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-muted/30 border-t-primary rounded-full"></div>
              <span className="ml-3 text-card-foreground">Chargement des statistiques...</span>
            </div>
          </CardContent>
        </Card>
      )}
      >
        <DashboardStats />
      </Suspense>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column - Recent Transactions */}
        <div className="space-y-8">
          <Suspense fallback={(
            <Card
              className="border-border/30 shadow-glass bg-card/25 backdrop-blur-lg"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-8 w-8 border-2 border-muted/30 border-t-primary rounded-full"></div>
                  <span className="ml-3 text-card-foreground">Chargement des transactions...</span>
                </div>
              </CardContent>
            </Card>
          )}
          >
            <RecentTransactions />
          </Suspense>
        </div>

        {/* Right Column - End of Day Report */}
        <div className="space-y-8">
          <EndOfDayReport />
        </div>
      </div>
    </div>
  )
}
