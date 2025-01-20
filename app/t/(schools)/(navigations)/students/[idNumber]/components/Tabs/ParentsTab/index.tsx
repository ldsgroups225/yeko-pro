'use client'

import type { Student } from '../../../types'
import type { CommunicationChannel, NotificationPreference } from './CommunicationPreferences'

import type { FamilyMember } from './FamilyOverview'

import type { ParentContact } from './ParentContacts'
import { Card } from '@/components/ui/card'
import consola from 'consola'
import { useCallback } from 'react'

import { CommunicationPreferences } from './CommunicationPreferences'
import { FamilyOverview } from './FamilyOverview'
import { ParentContacts } from './ParentContacts'

interface ParentsTabProps {
  student: Student
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockParents: ParentContact[] = [
  {
    id: 'father',
    type: 'father',
    firstName: 'Kouassi',
    lastName: 'Mederic',
    profession: 'Ingénieur',
    contacts: [
      { type: 'phone', value: '07 87 90 01 03', isPreferred: true },
      { type: 'email', value: 'mederic.kouassi@example.com' },
      { type: 'whatsapp', value: '07 87 90 01 03' },
    ],
    address: 'Cocody Angré',
    availability: 'Lun-Ven 18h-20h',
  },
  {
    id: 'mother',
    type: 'mother',
    firstName: 'Komenan',
    lastName: 'Sandrine',
    profession: 'Médecin',
    contacts: [
      { type: 'phone', value: '07 87 95 01 01', isPreferred: true },
      { type: 'email', value: 'sandrine.komenan@example.com' },
    ],
    address: 'Cocody Angré',
    availability: 'Weekend uniquement',
  },
]

const mockCommunicationChannels: CommunicationChannel[] = [
  {
    id: 'sms-father',
    type: 'sms',
    enabled: true,
    recipientId: 'father',
    preferredTime: '18:00',
    language: 'fr',
  },
  {
    id: 'email-mother',
    type: 'email',
    enabled: true,
    recipientId: 'mother',
    language: 'fr',
  },
  {
    id: 'whatsapp-father',
    type: 'whatsapp',
    enabled: true,
    recipientId: 'father',
    preferredTime: '19:00',
    language: 'fr',
  },
]

const mockNotifications: NotificationPreference[] = [
  {
    id: 'absence',
    type: 'Absences',
    description: 'Notifications en cas d\'absence ou de retard',
    channels: ['sms', 'whatsapp'],
    enabled: true,
  },
  {
    id: 'grades',
    type: 'Notes',
    description: 'Publication des notes et bulletins',
    channels: ['email'],
    enabled: true,
  },
  {
    id: 'events',
    type: 'Événements',
    description: 'Événements scolaires et réunions',
    channels: ['email', 'sms'],
    enabled: true,
  },
]

const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'sibling1',
    firstName: 'Kouassi',
    lastName: 'Marie',
    relationship: 'sibling',
    isStudent: true,
    schoolInfo: {
      idNumber: '2024125',
      class: '4ème A',
      school: 'Collège Saint Viateur',
    },
  },
  {
    id: 'sibling2',
    firstName: 'Kouassi',
    lastName: 'Junior',
    relationship: 'sibling',
    isStudent: true,
    schoolInfo: {
      idNumber: '2024789',
      class: 'CE2 B',
      school: 'École Primaire Saint Viateur',
    },
  },
]

export function ParentsTab({ student: _student, isLoading }: ParentsTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchParentsData(student.id) }, [student.id])

  const handleContactClick = useCallback((method: string, value: string) => {
    consola.log(`Contact clicked: ${method} - ${value}`)
    // TODO: Implement contact action (e.g., open email client, phone dialer)
  }, [])

  const handleToggleChannel = useCallback((channelId: string, enabled: boolean) => {
    consola.log(`Toggle channel ${channelId} to ${enabled}`)
    // TODO: Implement channel toggle API call
  }, [])

  const handleToggleNotification = useCallback((notificationId: string, enabled: boolean) => {
    consola.log(`Toggle notification ${notificationId} to ${enabled}`)
    // TODO: Implement notification toggle API call
  }, [])

  const handleUpdateChannel = useCallback((channelId: string, updates: Partial<CommunicationChannel>) => {
    consola.log(`Update channel ${channelId}:`, updates)
    // TODO: Implement channel update API call
  }, [])

  const handleViewFamilyMember = useCallback((memberId: string) => {
    consola.log(`View family member: ${memberId}`)
    // TODO: Implement navigation to member's profile
  }, [])

  return (
    <Card>
      <div className="space-y-6">
        <ParentContacts
          contacts={mockParents}
          onContactClick={handleContactClick}
          isLoading={isLoading}
        />

        <CommunicationPreferences
          channels={mockCommunicationChannels}
          notifications={mockNotifications}
          onToggleChannel={handleToggleChannel}
          onToggleNotification={handleToggleNotification}
          onUpdateChannel={handleUpdateChannel}
          isLoading={isLoading}
        />

        <FamilyOverview
          members={mockFamilyMembers}
          onViewMember={handleViewFamilyMember}
          isLoading={isLoading}
        />
      </div>
    </Card>
  )
}

export { CommunicationPreferences } from './CommunicationPreferences'
export type { CommunicationChannel, NotificationPreference } from './CommunicationPreferences'
export { FamilyOverview } from './FamilyOverview'

export type { FamilyMember } from './FamilyOverview'
// Re-export components
export { ParentContacts } from './ParentContacts'
// Re-export types
export type { ParentContact } from './ParentContacts'
