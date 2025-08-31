import { AlertTriangle, TrendingUp, UserPlus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ConductsManagement,
  DashboardStats,
  InscriptionsManagement,
  PendingInscriptionsCard,
  RecentConductsCard,
} from './_components'

interface PageProps {
  searchParams?: Promise<{
    page?: string
    limit?: string
    sort?: string
    searchTerm?: string
    classId?: string
    gradeFilter?: string
    scoreRange?: string
  }>
}

export default async function EducatorPage({ searchParams }: PageProps) {
  const params = await searchParams

  // Parse search parameters
  const parsedParams = {
    page: params?.page ? Number(params.page) : undefined,
    limit: params?.limit ? Number(params.limit) : undefined,
    sort: params?.sort
      ? (() => {
          try {
            return JSON.parse(params.sort!)
          }
          catch {
            return undefined
          }
        })()
      : undefined,
    searchTerm: params?.searchTerm,
    classId: params?.classId,
    gradeFilter: params?.gradeFilter as 'BLAME' | 'MAUVAISE' | 'PASSABLE' | 'BONNE' | 'TRES_BONNE' | undefined,
    scoreRange: params?.scoreRange
      ? (() => {
          try {
            return JSON.parse(params.scoreRange!)
          }
          catch {
            return undefined
          }
        })()
      : undefined,
  }

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-6">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <div className="animate-in slide-in-from-top duration-400 delay-100">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50 backdrop-blur-sm">
                <TabsTrigger
                  value="dashboard"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <TrendingUp className="h-4 w-4" />
                  Tableau de Bord
                </TabsTrigger>
                <TabsTrigger
                  value="conducts"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Conduites
                </TabsTrigger>
                <TabsTrigger
                  value="inscriptions"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4" />
                  Inscriptions
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-8 animate-in slide-in-from-right duration-300">
              <div className="space-y-8">
                <DashboardStats />
                <div className="grid gap-8 md:grid-cols-2">
                  <RecentConductsCard />
                  <PendingInscriptionsCard />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conducts" className="space-y-6 animate-in slide-in-from-right duration-300">
              <ConductsManagement params={Promise.resolve(parsedParams)} />
            </TabsContent>

            <TabsContent value="inscriptions" className="space-y-6 animate-in slide-in-from-right duration-300">
              <InscriptionsManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
