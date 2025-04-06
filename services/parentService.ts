import { createClient } from '@/lib/supabase/client'

export interface ParentContact {
  id: string
  type: 'father' | 'mother' | 'guardian'
  firstName: string
  lastName: string
  profession?: string
  contacts: {
    type: 'phone' | 'email' | 'whatsapp'
    value: string
    isPreferred?: boolean
  }[]
  address?: string
  availability?: string
}

export interface CommunicationChannel {
  id: string
  type: 'email' | 'whatsapp' | 'sms' | 'call'
  enabled: boolean
  recipientId: string
  preferredTime?: string
  language: string
}

export interface NotificationPreference {
  id: string
  type: string
  description: string
  channels: ('email' | 'whatsapp' | 'sms' | 'call')[]
  enabled: boolean
}

export interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  relationship: string
  isStudent: boolean
  schoolInfo?: {
    idNumber: string
    class: string
    school: string
  }
}

export async function getStudentParents(studentId: string): Promise<ParentContact[]> {
  const supabase = createClient()

  const { data: student, error: studentError } = await supabase
    .from('students')
    .select(`
      parent_id,
      users:parent_id (
        id,
        first_name,
        last_name,
        email,
        phone,
        avatar_url,
        state_id
      )
    `)
    .eq('id', studentId)
    .single()

  if (studentError)
    throw new Error('Error fetching parent data')
  if (!student?.users)
    return []

  const parent = student.users

  // Format the parent data
  const parentContact: ParentContact = {
    id: parent.id,
    type: 'guardian', // Default to guardian since we don't store the relationship type
    firstName: parent.first_name || '',
    lastName: parent.last_name || '',
    contacts: [
      ...(parent.phone ? [{ type: 'phone' as const, value: parent.phone, isPreferred: true }] : []),
      ...(parent.email ? [{ type: 'email' as const, value: parent.email }] : []),
    ],
  }

  return [parentContact]
}

export async function getFamilyMembers(studentId: string): Promise<FamilyMember[]> {
  const supabase = createClient()

  // First get the student's parent_id
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('parent_id')
    .eq('id', studentId)
    .single()

  if (studentError)
    throw new Error('Error fetching student data')
  if (!student?.parent_id)
    return []

  // Then get all siblings (other students with the same parent)
  const { data: siblings, error: siblingsError } = await supabase
    .from('students')
    .select(`
      id,
      first_name,
      last_name,
      id_number,
      student_school_class!inner (
        class_id,
        classes (
          name
        ),
        school_id,
        schools (
          name
        )
      )
    `)
    .eq('parent_id', student.parent_id)
    .neq('id', studentId) // Exclude the current student

  if (siblingsError)
    throw new Error('Error fetching family members')
  if (!siblings)
    return []

  return siblings.map((sibling) => {
    const schoolClass = sibling.student_school_class?.[0]
    return {
      id: sibling.id,
      firstName: sibling.first_name,
      lastName: sibling.last_name,
      relationship: 'sibling',
      isStudent: true,
      schoolInfo: {
        idNumber: sibling.id_number,
        class: schoolClass?.classes?.name || '',
        school: schoolClass?.schools?.name || '',
      },
    }
  })
}

export async function getCommunicationPreferences(_parentId: string): Promise<{
  channels: CommunicationChannel[]
  notifications: NotificationPreference[]
}> {
  // TODO: Implement when we add communication preferences tables
  // For now, return empty arrays
  return {
    channels: [],
    notifications: [],
  }
}

export async function updateCommunicationChannel(
  _channelId: string,
  _updates: Partial<CommunicationChannel>,
): Promise<void> {
  // TODO: Implement when we add communication preferences tables
  console.warn('Communication channel updates not implemented yet')
}

export async function updateNotificationSetting(
  _notificationId: string,
  _enabled: boolean,
): Promise<void> {
  // TODO: Implement when we add notification settings tables
  console.warn('Notification setting updates not implemented yet')
}

export async function getParentProfile(parentId: string) {
  const supabase = createClient()

  const { data: parent, error } = await supabase
    .from('users')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      avatar_url,
      state_id,
      states (
        name
      )
    `)
    .eq('id', parentId)
    .single()

  if (error)
    throw new Error('Error fetching parent profile')
  if (!parent)
    return null

  return {
    id: parent.id,
    firstName: parent.first_name || '',
    lastName: parent.last_name || '',
    email: parent.email,
    phone: parent.phone,
    avatarUrl: parent.avatar_url,
    state: parent.states?.name,
  }
}
