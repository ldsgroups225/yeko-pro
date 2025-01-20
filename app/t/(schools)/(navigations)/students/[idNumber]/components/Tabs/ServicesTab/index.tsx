'use client'

import type { Student } from '../../../types'
import type { ServicePreference } from './ServicePreferences'

import type { ServiceSubscription } from './ServiceSubscriptions'

import type { ServiceUsageData } from './ServiceUsage'

import { Card } from '@/components/ui/card'
import consola from 'consola'
import { useCallback } from 'react'

import { ServicePreferences } from './ServicePreferences'
import { ServiceSubscriptions } from './ServiceSubscriptions'
import { ServiceUsage } from './ServiceUsage'

interface ServicesTabProps {
  student: Student
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockSubscriptions: ServiceSubscription[] = [
  {
    id: 'transport',
    name: 'Transport Scolaire',
    type: 'transport',
    description: 'Service de ramassage scolaire porte-à-porte',
    isActive: true,
    startDate: '01/09/2024',
    cost: {
      amount: 50000,
      period: 'month',
    },
    settings: [
      {
        id: 'pickup',
        label: 'Point de ramassage',
        value: 'Angré 8e Tranche',
      },
    ],
  },
  {
    id: 'cafeteria',
    name: 'Cantine',
    type: 'cafeteria',
    description: 'Service de restauration scolaire',
    isActive: true,
    startDate: '01/09/2024',
    cost: {
      amount: 25000,
      period: 'month',
    },
  },
  {
    id: 'library',
    name: 'Bibliothèque',
    type: 'library',
    description: 'Accès à la bibliothèque et prêt de livres',
    isActive: false,
    cost: {
      amount: 10000,
      period: 'year',
    },
  },
]

const mockUsage: ServiceUsageData[] = [
  {
    id: 'transport-usage',
    serviceType: 'transport',
    period: 'Janvier 2025',
    usageCount: 15,
    totalAllowed: 22,
    lastUsed: '19/01/2025',
    details: [
      {
        date: '19/01/2025',
        description: 'Trajet retour',
      },
      {
        date: '19/01/2025',
        description: 'Trajet aller',
      },
      {
        date: '18/01/2025',
        description: 'Trajet retour',
      },
    ],
  },
  {
    id: 'cafeteria-usage',
    serviceType: 'cafeteria',
    period: 'Janvier 2025',
    usageCount: 12,
    totalAllowed: 20,
    lastUsed: '19/01/2025',
    details: [
      {
        date: '19/01/2025',
        description: 'Déjeuner',
      },
      {
        date: '18/01/2025',
        description: 'Déjeuner',
      },
      {
        date: '17/01/2025',
        description: 'Déjeuner',
      },
    ],
  },
]

const mockPreferences: ServicePreference[] = [
  {
    id: 'transport-notifications',
    serviceId: 'transport',
    serviceName: 'Transport',
    settingType: 'toggle',
    label: 'Notifications de transport',
    description: 'Recevoir des notifications pour les retards ou changements',
    currentValue: 'true',
    category: 'notifications',
  },
  {
    id: 'transport-pickup-time',
    serviceId: 'transport',
    serviceName: 'Transport',
    settingType: 'time',
    label: 'Heure de ramassage',
    description: 'Heure de passage du bus (matin)',
    currentValue: '07:00',
    category: 'schedule',
  },
  {
    id: 'cafeteria-menu-notifications',
    serviceId: 'cafeteria',
    serviceName: 'Cantine',
    settingType: 'toggle',
    label: 'Notifications de menu',
    description: 'Recevoir le menu de la semaine',
    currentValue: 'true',
    category: 'notifications',
  },
  {
    id: 'cafeteria-diet',
    serviceId: 'cafeteria',
    serviceName: 'Cantine',
    settingType: 'select',
    label: 'Régime alimentaire',
    description: 'Restrictions ou préférences alimentaires',
    currentValue: 'standard',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'vegetarian', label: 'Végétarien' },
      { value: 'halal', label: 'Halal' },
    ],
    category: 'general',
  },
]

export function ServicesTab({ student: _student, isLoading }: ServicesTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchServiceData(student.id) }, [student.id])

  const handleToggleService = useCallback((serviceId: string, active: boolean) => {
    consola.log(`Toggle service ${serviceId} to ${active}`)
    // TODO: Implement service toggle API call
  }, [])

  const handleUpdatePreference = useCallback((preferenceId: string, value: string) => {
    consola.log(`Update preference ${preferenceId} to ${value}`)
    // TODO: Implement preference update API call
  }, [])

  return (
    <Card>
      <div className="space-y-6">
        <ServiceSubscriptions
          services={mockSubscriptions}
          onToggleService={handleToggleService}
          isLoading={isLoading}
        />

        <ServiceUsage
          usage={mockUsage}
          isLoading={isLoading}
        />

        <ServicePreferences
          preferences={mockPreferences}
          onUpdatePreference={handleUpdatePreference}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}

// Re-export components
export { ServicePreferences } from './ServicePreferences'
// Re-export types
export type { ServicePreference } from './ServicePreferences'
export { ServiceSubscriptions } from './ServiceSubscriptions'

export type { ServiceSubscription } from './ServiceSubscriptions'
export { ServiceUsage } from './ServiceUsage'
export type { ServiceUsageData } from './ServiceUsage'
