'use client'

import {
  BackpackIcon,
  BarChartIcon,
  BellIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ClockIcon,
  FileTextIcon,
  MixIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import QuickAccessButton from './QuickAccessButton'

/**
 * Represents a button in the quick access section.
 */
interface QuickAccessButtonProps {
  icon: React.ReactNode
  label: string
  href: string
}

/**
 * Data for the quick access buttons.
 */
const quickAccessButtonsData: QuickAccessButtonProps[] = [
  {
    icon: <PersonIcon width={42} height={42} />,
    label: 'Gestion des effectifs',
    href: '/students',
  },
  {
    icon: <FileTextIcon width={42} height={42} />,
    label: 'Notes et moyennes',
    href: '/notes',
  },
  {
    icon: <CalendarIcon width={42} height={42} />,
    label: 'Emploi du temps',
    href: '/schedules',
  },
  {
    icon: <ClockIcon width={42} height={42} />,
    label: 'Ponctualité',
    href: '/schedules',
  },
  {
    icon: <BackpackIcon width={42} height={42} />,
    label: 'Scolarité',
    href: '/schools',
  },
  {
    icon: <MixIcon width={42} height={42} />,
    label: 'Professeur',
    href: '/teachers',
  },
  {
    icon: <BellIcon width={42} height={42} />,
    label: 'Information',
    href: '/notifications',
  },
  {
    icon: <BarChartIcon width={42} height={42} />,
    label: 'Suivi de performance',
    href: '/performance',
  },
  {
    icon: <ChatBubbleIcon width={42} height={42} />,
    label: 'Discussion',
    href: '/discussion',
  },
]

/**
 * Displays the quick access buttons.
 */
export const QuickAccess: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-3/5 mb-6 md:mb-0">
      {quickAccessButtonsData.map(button => (
        <QuickAccessButton
          key={button.label.replaceAll(' ', '-').toLowerCase()}
          disabled={isLoading}
          {...button}
        />
      ))}
    </div>
  )
}
