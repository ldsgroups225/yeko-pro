'use client'

import type { Student } from '../../../types'
import type { EmergencyContact } from './EmergencyContacts'
import type { HealthRecord } from './HealthRecords'
import type { MedicalCondition } from './MedicalConditionsOverview'
import { Card } from '@/components/ui/card'

import { EmergencyContacts } from './EmergencyContacts'
import { HealthRecords } from './HealthRecords'
import { MedicalConditionsOverview } from './MedicalConditionsOverview'

interface HealthTabProps {
  student: Student
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockConditions: MedicalCondition[] = [
  {
    id: 'c1',
    type: 'condition',
    name: 'Asthme',
    severity: 'medium',
    description: 'Asthme d\'effort',
    instructions: 'Avoir toujours son inhalateur à portée de main',
    dateIdentified: '15/09/2023',
    status: 'managed',
  },
  {
    id: 'c2',
    type: 'allergy',
    name: 'Allergie aux arachides',
    severity: 'high',
    description: 'Allergie sévère aux arachides et dérivés',
    instructions: 'Éviter tout contact avec les arachides. EpiPen disponible à l\'infirmerie',
    dateIdentified: '10/01/2022',
    status: 'active',
  },
]

const mockRecords: HealthRecord[] = [
  {
    id: 'r1',
    type: 'checkup',
    title: 'Visite médicale annuelle',
    date: '15/01/2025',
    provider: 'Dr. Kouassi',
    description: 'Bilan de santé normal. Croissance et développement conformes.',
    nextDue: '15/01/2026',
    attachments: 2,
  },
  {
    id: 'r2',
    type: 'vaccination',
    title: 'Rappel DTP',
    date: '22/12/2024',
    provider: 'Centre de vaccination',
    description: 'Rappel vaccin Diphtérie-Tétanos-Polio effectué',
    nextDue: '22/12/2034',
    attachments: 1,
  },
]

const mockContacts: EmergencyContact[] = [
  {
    id: 'ec1',
    type: 'doctor',
    name: 'Dr. Kouassi',
    role: 'Médecin traitant',
    phone: '07 87 90 01 03',
    address: 'Cabinet Médical Cocody',
    availability: 'Lun-Ven 8h-18h',
    priority: 2,
  },
  {
    id: 'ec2',
    type: 'hospital',
    name: 'Clinique Sainte Marie',
    phone: '20 25 45 67 89',
    address: 'Avenue des Hôpitaux, Cocody',
    priority: 3,
  },
  {
    id: 'ec3',
    type: 'relative',
    name: 'Mme Kouassi',
    role: 'Mère',
    phone: '07 87 95 01 01',
    priority: 1,
  },
]

export function HealthTab({ student: _student, isLoading }: HealthTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchHealthData(student.id) }, [student.id])

  return (
    <Card>
      <div className="space-y-6">
        <MedicalConditionsOverview
          conditions={mockConditions}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6">
          <HealthRecords
            records={mockRecords}
            isLoading={isLoading}
          />

          <EmergencyContacts
            contacts={mockContacts}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Card>
  )
}

export { EmergencyContacts } from './EmergencyContacts'
export type { EmergencyContact } from './EmergencyContacts'
export { HealthRecords } from './HealthRecords'

export type { HealthRecord } from './HealthRecords'
// Re-export components
export { MedicalConditionsOverview } from './MedicalConditionsOverview'
// Re-export types
export type { MedicalCondition } from './MedicalConditionsOverview'
