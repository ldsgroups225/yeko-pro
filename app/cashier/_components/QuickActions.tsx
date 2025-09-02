import {
  Calendar,
  ChevronRight,
  DollarSign,
  FileText,
  Receipt,
  Search,
  Users,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function QuickActions() {
  const actions = [
    {
      title: 'Rechercher Étudiant',
      description: 'Trouver un étudiant par nom ou matricule',
      icon: Search,
      href: '/cashier/students',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Nouveau Paiement',
      description: 'Enregistrer un paiement',
      icon: DollarSign,
      href: '/cashier/payments',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Générer Rapport',
      description: 'Rapport de fin de journée',
      icon: FileText,
      href: '/cashier/reports',
      color: 'from-purple-500 to-violet-500',
    },
    {
      title: 'Étudiants Impayés',
      description: 'Voir les retards de paiement',
      icon: Users,
      href: '/cashier/overdue',
      color: 'from-orange-500 to-red-500',
    },
  ]

  // Helper function to safely extract colors from Tailwind gradient classes
  const getGradientColors = (colorString?: string) => {
    if (!colorString) {
      return { from: '#3b82f6', to: '#06b6d4' } // Default blue gradient
    }

    const parts = colorString.split(' ')
    const fromColor = parts[0]?.replace('from-', '') || 'blue-500'
    const toColor = parts[2]?.replace('to-', '') || 'cyan-500'

    // Convert Tailwind color classes to hex values
    const colorMap: Record<string, string> = {
      'blue-500': '#3b82f6',
      'cyan-500': '#06b6d4',
      'green-500': '#22c55e',
      'emerald-500': '#10b981',
      'purple-500': '#a855f7',
      'violet-500': '#8b5cf6',
      'orange-500': '#f97316',
      'red-500': '#ef4444',
    }

    return {
      from: colorMap[fromColor] || '#3b82f6',
      to: colorMap[toColor] || '#06b6d4',
    }
  }

  return (
    <Card
      className="border-white/20 shadow-2xl"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <CardHeader>
        <CardTitle className="text-white text-lg">Actions Rapides</CardTitle>
        <CardDescription className="text-white/70">
          Accès direct aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            const colors = getGradientColors(action.color)

            return (
              <Link key={nanoid()} href={action.href}>
                <div
                  className="group relative p-6 rounded-xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
                >
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
                    }}
                  />

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="p-3 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${colors.from}20 0%, ${colors.to}20 100%)`,
                        }}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-white group-hover:text-white/90">
                          {action.title}
                        </h3>
                        <p className="text-sm text-white/70 group-hover:text-white/80">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-white/50 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Additional Quick Links */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/cashier/receipts">
                <Receipt className="h-4 w-4 mr-2" />
                Reçus du Jour
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/cashier/schedule">
                <Calendar className="h-4 w-4 mr-2" />
                Planning
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
