'use client'

import type { Student } from '../../../types'
import type { MedicalCondition } from './MedicalInfo'
import type { Service } from './SubscribedServices'
import consola from 'consola'
import { Bus, Utensils } from 'lucide-react'
import { MedicalInfo } from './MedicalInfo'
import { PersonalInfo } from './PersonalInfo'
import { SubscribedServices } from './SubscribedServices'

interface ProfileTabProps {
  student: Student
  isLoading?: boolean
}

export function ProfileTab({ student, isLoading }: ProfileTabProps) {
  // Mock data - Replace with actual data fetching
  const services: Service[] = [
    {
      id: 'transport',
      name: 'Transport Scolaire',
      icon: <Bus className="h-5 w-5 text-muted-foreground" />,
      isActive: false,
      onToggle: (checked: boolean) => {
        consola.log('Transport toggled:', checked)
      },
    },
    {
      id: 'cafeteria',
      name: 'Cantine',
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />,
      isActive: true,
      onToggle: (checked: boolean) => {
        consola.log('Cafeteria toggled:', checked)
      },
    },
  ]

  const medicalConditions: MedicalCondition[] = [
    {
      id: 'asthma',
      description: 'L\'élève est asthmatique - Nécessite un inhalateur',
      severity: 'medium',
    },
  ]

  return (
    <div className="space-y-6">
      <PersonalInfo student={student} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubscribedServices
          services={services}
          isLoading={isLoading}
        />
        <MedicalInfo
          conditions={medicalConditions}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export { MedicalInfo } from './MedicalInfo'
export type { MedicalCondition } from './MedicalInfo'
// Re-export sub-components for direct access if needed
export { PersonalInfo } from './PersonalInfo'
export { SubscribedServices } from './SubscribedServices'
export type { Service } from './SubscribedServices'
