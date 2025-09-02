// app/cashier/_data/auth.ts

'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

interface CashierAuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl?: string
  schoolId: string
  schoolName: string
  roles: ERole[]
}

/**
 * Gets the current authenticated user's basic information.
 *
 * @returns {Promise<string | null>} The current user ID or null if not authenticated
 */
async function getUserId(): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  return user?.id ?? null
}

/**
 * Fetches cashier user data from database and verifies cashier access
 * This function is cached using React's cache function for request deduplication
 */
const getCashierUserFromDatabase = cache(async (): Promise<CashierAuthUser> => {
  const supabase = await createClient()

  // Get authenticated user ID
  const userId = await getUserId()
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Get user roles and verify cashier access
  const { data: role } = await supabase
    .from('user_roles')
    .select(`
      school_id,
      user:users!inner(id, first_name, last_name, email, avatar_url),
      school:schools!inner(id, name)
    `)
    .eq('user_id', userId)
    .eq('role_id', ERole.CASHIER)
    .single()

  if (!role) {
    throw new Error('User does not have cashier access')
  }

  return {
    id: role.user.id,
    email: role.user.email,
    firstName: role.user.first_name ?? '',
    lastName: role.user.last_name ?? '',
    fullName: `${role.user.first_name} ${role.user.last_name}`,
    avatarUrl: role.user.avatar_url || undefined,
    schoolId: role.school_id ?? '',
    schoolName: role.school.name,
    roles: [ERole.CASHIER],
  }
})

/**
 * Gets the authenticated cashier user with caching
 * This is the main function to use in server components
 */
export const getAuthenticatedCashierUser = cache(async (): Promise<CashierAuthUser> => {
  try {
    return await getCashierUserFromDatabase()
  }
  catch (error) {
    console.error('Error getting authenticated cashier user:', error)
    throw error
  }
})

/**
 * Checks if current user has cashier access without throwing errors
 * Useful for conditional rendering
 */
export const hasCashierAccess = cache(async (): Promise<boolean> => {
  try {
    await getAuthenticatedCashierUser()
    return true
  }
  catch {
    return false
  }
})

/**
 * Gets cashier user data or returns null if not authenticated/authorized
 * Useful when you want to handle auth failures gracefully
 */
export const getCashierUserOrNull = cache(async (): Promise<CashierAuthUser | null> => {
  try {
    return await getAuthenticatedCashierUser()
  }
  catch {
    return null
  }
})
