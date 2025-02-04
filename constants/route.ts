import type { ElementType } from 'react'
import { Bell, BookOpen, Calendar, Home, Settings, Users, UsersRound, Wallet2Icon } from 'lucide-react'

interface ISidebarItem {
  icon: ElementType
  label: string
  href: string
  ariaLabel?: string
}

export const sidebarItems: ISidebarItem[] = [
  {
    icon: Home,
    label: 'Tableau de bord',
    href: '/t/dashboard',
    ariaLabel: 'Accéder au tableau de bord',
  },
  {
    icon: Users,
    label: 'Élèves',
    href: '/t/students',
    ariaLabel: 'Gérer les élèves',
  },
  {
    icon: BookOpen,
    label: 'Classes',
    href: '/t/classes',
    ariaLabel: 'Voir les classes',
  },
  {
    icon: UsersRound,
    label: 'Professeurs',
    href: '/t/teachers',
    ariaLabel: 'Gérer les professeurs',
  },
  {
    icon: Calendar,
    label: 'Emploi du temps',
    href: '/t/schedules',
    ariaLabel: 'Consulter l\'emploi du temps',
  },
  {
    icon: Wallet2Icon,
    label: 'Comptabilité',
    href: '/t/accounting',
    ariaLabel: 'Voir les comptes',
  },
  {
    icon: Bell,
    label: 'Notifications',
    href: '/t/notifications',
    ariaLabel: 'Voir les notifications',
  },
  {
    icon: Settings,
    label: 'Configurations',
    href: '/t/settings',
    ariaLabel: 'Modifier les configurations',
  },
]

const otherRoutes: ISidebarItem[] = [
  {
    icon: Home,
    label: 'Détails',
    href: '/t/classes/[slug]',
    ariaLabel: 'Accéder au détails d\'une classe',
  },
]

export const mergedRoutes = [...sidebarItems, ...otherRoutes]
