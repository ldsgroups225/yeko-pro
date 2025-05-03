'use client'

import type { Student } from '../../../types'
import type { Service } from './SubscribedServices'
import { Bus, Utensils } from 'lucide-react'
import { MedicalInfo } from './MedicalInfo'
import { PersonalInfo } from './PersonalInfo'
import { SubscribedServices } from './SubscribedServices'

interface ProfileTabProps {
  student: Student
  isLoading?: boolean
}

export function ProfileTab({ student, isLoading }: ProfileTabProps) {
  const services: Service[] = [
    {
      id: 'transport',
      name: 'Transport Scolaire',
      icon: <Bus className="h-5 w-5 text-muted-foreground" />,
      isActive: student.hasSubscribedTransportationService,
      onToggle: () => {},
    },
    {
      id: 'cafeteria',
      name: 'Cantine',
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />,
      isActive: student.hasSubscribedCanteenService,
      onToggle: () => {},
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
          conditions={student.medicalCondition}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export { MedicalInfo } from './MedicalInfo'
export { PersonalInfo } from './PersonalInfo'
export { SubscribedServices } from './SubscribedServices'
export type { Service } from './SubscribedServices'
