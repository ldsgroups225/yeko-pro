import type { ElementType } from 'react'
import { Bell, BookOpen, Calendar, Home, Settings, Users } from 'lucide-react'

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
    icon: Calendar,
    label: 'Emploi du temps',
    href: '/t/schedules',
    ariaLabel: 'Consulter l\'emploi du temps',
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
