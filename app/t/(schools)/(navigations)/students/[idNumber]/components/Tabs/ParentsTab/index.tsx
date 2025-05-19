'use client'

import type { Student } from '../../../types'
// import type { CommunicationChannel, NotificationPreference } from './CommunicationPreferences'
// import type { FamilyMember } from './FamilyOverview'
import type { ParentContact } from './ParentContacts'

import { Card } from '@/components/ui/card'
// import { getCommunicationPreferences, getFamilyMembers, getStudentParents } from '@/services/parentService'
import { getStudentParents } from '@/services/parentService'
import consola from 'consola'
import { useCallback, useEffect, useState } from 'react'

// import { CommunicationPreferences } from './CommunicationPreferences'
// import { FamilyOverview } from './FamilyOverview'
import { ParentContacts } from './ParentContacts'

interface ParentsTabProps {
  student: Student
  isLoading?: boolean
}

export function ParentsTab({ student, isLoading: initialLoading }: ParentsTabProps) {
  const [parents, setParents] = useState<ParentContact[]>([])
  // const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  // const [communicationChannels, setCommunicationChannels] = useState<CommunicationChannel[]>([])
  // const [notifications, setNotifications] = useState<NotificationPreference[]>([])
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchParentData() {
      if (!student?.id)
        return
      setIsLoading(true)
      setError(null)

      try {
        // Fetch parent data and family members in parallel
        // const [parents, familyMembers, communicationPrefs] = await Promise.all([
        const [parents] = await Promise.all([
          getStudentParents(student.id),
          // getFamilyMembers(student.id),
          // getCommunicationPreferences(student.id),
        ])

        setParents(parents)
        // setFamilyMembers(familyMembers)
        // setCommunicationChannels(communicationPrefs.channels)
        // setNotifications(communicationPrefs.notifications)
      }
      catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        consola.error('Error fetching parent data:', err)
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchParentData()
  }, [student?.id])

  const handleContactClick = useCallback((method: string, value: string) => {
    consola.log(`Contact clicked: ${method} - ${value}`)
    // TODO: Implement contact action (e.g., open email client, phone dialer)
  }, [])

  // const handleToggleChannel = useCallback((channelId: string, enabled: boolean) => {
  //   consola.log(`Toggle channel ${channelId} to ${enabled}`)
  //   // TODO: Implement channel toggle API call once we have the tables
  // }, [])

  // const handleToggleNotification = useCallback((notificationId: string, enabled: boolean) => {
  //   consola.log(`Toggle notification ${notificationId} to ${enabled}`)
  //   // TODO: Implement notification toggle API call once we have the tables
  // }, [])

  // const handleUpdateChannel = useCallback((channelId: string, updates: Partial<CommunicationChannel>) => {
  //   consola.log(`Update channel ${channelId}:`, updates)
  //   // TODO: Implement channel update API call once we have the tables
  // }, [])

  // const handleViewFamilyMember = useCallback((memberId: string) => {
  //   consola.log(`View family member: ${memberId}`)
  //   // TODO: Implement navigation to member's profile
  // }, [])

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center text-red-500">
          <p>
            Error loading parent data:
            {error}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="space-y-6">
        <ParentContacts
          contacts={parents}
          onContactClick={handleContactClick}
          isLoading={isLoading}
        />

        {/* <CommunicationPreferences
          channels={communicationChannels}
          notifications={notifications}
          onToggleChannel={handleToggleChannel}
          onToggleNotification={handleToggleNotification}
          onUpdateChannel={handleUpdateChannel}
          isLoading={isLoading}
        /> */}

        {/* <FamilyOverview
          members={familyMembers}
          onViewMember={handleViewFamilyMember}
          isLoading={isLoading}
        /> */}
      </div>
    </Card>
  )
}

export { CommunicationPreferences } from './CommunicationPreferences'
export { FamilyOverview } from './FamilyOverview'
export type { FamilyMember } from './FamilyOverview'
export { ParentContacts } from './ParentContacts'
export type { ParentContact } from './ParentContacts'
