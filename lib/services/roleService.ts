'use server'

import type { ERole } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { ROLE_PRIORITY } from '@/lib/types/auth'
import { createDefaultUserRoleInfo, createUserRoleInfo } from '@/lib/utils/roleUtils'

/**
 * Fetches user roles from database
 * This is the single source of truth for role fetching
 */
export async function fetchUserRolesFromDB(userId: string) {
  const supabase = await createClient()

  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('id, role_id, school_id, grade_id, created_at, created_by, updated_at, updated_by')
    .eq('user_id', userId)
    .order('created_at', { ascending: true }) // Get the oldest role first as fallback

  if (error || !userRoles?.length) {
    return createDefaultUserRoleInfo(userId)
  }

  // Map all roles and find the one with highest priority
  const roles = userRoles.map(ur => ur.role_id as ERole)

  // Find the highest priority role based on ROLE_PRIORITY
  let primaryRole: ERole | null = null
  for (const priorityRole of ROLE_PRIORITY) {
    if (roles.includes(priorityRole)) {
      primaryRole = priorityRole
      break
    }
  }

  // If no role found in priority list, use the first one
  if (!primaryRole && roles.length > 0) {
    primaryRole = roles[0]
  }

  // Get the user role entry for the primary role
  const primaryRoleEntry = userRoles.find(ur => ur.role_id === primaryRole) || userRoles[0]

  if (!primaryRoleEntry.school_id) {
    throw new Error('Vous n\'êtes pas associé à une école')
  }

  return createUserRoleInfo(
    userId,
    roles,
    primaryRoleEntry.school_id,
    primaryRoleEntry.grade_id || null,
  )
}

/**
 * Middleware-compatible version of fetchUserRolesFromDB
 * Uses different Supabase client for edge runtime
 */
export async function fetchUserRolesFromDBMiddleware(
  userId: string,
  cookies: any[],
  supabaseUrl: string,
  supabaseAnonKey: string,
) {
  const { createServerClient } = await import('@supabase/ssr')

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookies
        },
        setAll() {
          // We don't set cookies in this context
        },
      },
    },
  )

  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('id, role_id, school_id, grade_id, created_at, created_by, updated_at, updated_by')
    .eq('user_id', userId)
    .order('created_at', { ascending: true }) // Get the oldest role first as fallback

  if (error || !userRoles?.length) {
    return createDefaultUserRoleInfo(userId)
  }

  // Map all roles and find the one with highest priority
  const roles = userRoles.map(ur => ur.role_id as ERole)

  // Find the highest priority role based on ROLE_PRIORITY
  let primaryRole: ERole | null = null
  for (const priorityRole of ROLE_PRIORITY) {
    if (roles.includes(priorityRole)) {
      primaryRole = priorityRole
      break
    }
  }

  // If no role found in priority list, use the first one
  if (!primaryRole && roles.length > 0) {
    primaryRole = roles[0]
  }

  // Get the user role entry for the primary role
  const primaryRoleEntry = userRoles.find(ur => ur.role_id === primaryRole) || userRoles[0]

  return createUserRoleInfo(
    userId,
    roles,
    primaryRoleEntry.school_id || null,
    primaryRoleEntry.grade_id || null,
  )
}
