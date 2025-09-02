'use client'

import {
  DollarSign,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Wallet,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    href: '/cashier',
    label: 'Tableau de Bord',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble des activités',
  },
  {
    href: '/cashier/students',
    label: 'Recherche Étudiant',
    icon: Search,
    description: 'Trouver un étudiant',
  },
  {
    href: '/cashier/payments',
    label: 'Nouveau Paiement',
    icon: DollarSign,
    description: 'Enregistrer un paiement',
  },
  {
    href: '/cashier/reports',
    label: 'Rapports',
    icon: FileText,
    description: 'Fin de journée',
  },
]

export function CashierSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Caisse</h2>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white text-xs border-white/30"
                >
                  École Sainte-Marie
                </Badge>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden md:flex text-white hover:bg-white/10"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                'hover:bg-white/10 hover:backdrop-blur-sm',
                isActive
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg'
                  : 'text-white/80 hover:text-white',
                isCollapsed ? 'justify-center' : 'justify-start',
              )}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 text-white">
              <div className="text-sm font-medium">Marie Kouadio</div>
              <div className="text-xs opacity-70">Caissier Principal</div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-white/80 hover:text-white hover:bg-white/10',
              isCollapsed ? 'px-3' : 'justify-start gap-3 px-4',
            )}
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Paramètres</span>}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-white/80 hover:text-white hover:bg-white/10',
              isCollapsed ? 'px-3' : 'justify-start gap-3 px-4',
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Déconnexion</span>}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-sm text-white border border-white/20"
        onClick={toggleMobileSidebar}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out',
          'bg-white/10 backdrop-blur-2xl border-r border-white/20',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
