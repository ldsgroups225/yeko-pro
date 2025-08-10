'use client'

import type { Student } from '../../../types'
import { useState } from 'react'
import { MedicalInfo } from './MedicalInfo'
import { PersonalInfo } from './PersonalInfo'
import { SubscribedServices } from './SubscribedServices'

interface ProfileTabProps {
  student: Student
  isLoading?: boolean
}

export function ProfileTab({ student, isLoading }: ProfileTabProps) {
  // Local state to manage service updates optimistically
  const [localServiceState, setLocalServiceState] = useState({
    hasSubscribedTransportationService: student.hasSubscribedTransportationService,
    hasSubscribedCanteenService: student.hasSubscribedCanteenService,
  })

  const handleServiceUpdate = (serviceType: 'transport' | 'cafeteria', newStatus: boolean) => {
    // Update local state optimistically
    setLocalServiceState(prev => ({
      ...prev,
      ...(serviceType === 'transport'
        ? { hasSubscribedTransportationService: newStatus }
        : { hasSubscribedCanteenService: newStatus }
      ),
    }))
  }

  return (
    <div className="space-y-6">
      <PersonalInfo student={student} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubscribedServices
          enrollmentId={student.enrollmentId}
          hasSubscribedTransportationService={localServiceState.hasSubscribedTransportationService}
          hasSubscribedCanteenService={localServiceState.hasSubscribedCanteenService}
          isLoading={isLoading}
          onServiceUpdate={handleServiceUpdate}
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
