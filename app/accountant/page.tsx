import { Calculator, DollarSign, PieChart, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AccountantPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Comptable</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue dans votre espace de gestion comptable
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Calculator className="w-4 h-4 mr-2" />
          Comptable
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">À venir</div>
            <p className="text-xs text-muted-foreground">
              Fonctionnalité en développement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">À venir</div>
            <p className="text-xs text-muted-foreground">
              Fonctionnalité en développement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rapports</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">À venir</div>
            <p className="text-xs text-muted-foreground">
              Fonctionnalité en développement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">À venir</div>
            <p className="text-xs text-muted-foreground">
              Fonctionnalité en développement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Interface Comptable</CardTitle>
          <CardDescription>
            Votre tableau de bord comptable est en cours de développement.
            Les fonctionnalités suivantes seront bientôt disponibles :
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Gestion Financière</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Suivi des revenus et dépenses</li>
                <li>• Gestion des frais scolaires</li>
                <li>• Facturation automatisée</li>
                <li>• États financiers</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Rapports & Analyses</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Rapports mensuels/annuels</li>
                <li>• Analyses budgétaires</li>
                <li>• Prévisions financières</li>
                <li>• Exports comptables</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
