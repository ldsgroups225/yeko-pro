import { Clock, CreditCard, Receipt, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CashierPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Caisse</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue dans votre espace de gestion des paiements
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <CreditCard className="w-4 h-4 mr-2" />
          Caissier(ère)
        </Badge>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encaissements Aujourd'hui</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Étudiants Payés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Heures de Service</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle>Interface Caisse</CardTitle>
          <CardDescription>
            Votre tableau de bord de caisse est en cours de développement.
            Les fonctionnalités suivantes seront bientôt disponibles :
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Gestion des Paiements</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Encaissement des frais scolaires</li>
                <li>• Gestion des acomptes</li>
                <li>• Paiements échelonnés</li>
                <li>• Remboursements</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Outils & Rapports</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Génération de reçus</li>
                <li>• Historique des transactions</li>
                <li>• Rapports journaliers</li>
                <li>• Suivi des impayés</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
