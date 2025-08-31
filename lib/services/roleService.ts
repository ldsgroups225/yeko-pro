'use server'

import type { ERole } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { createDefaultUserRoleInfo, createUserRoleInfo } from '@/lib/utils/roleUtils'

/**
 * Fetches user roles from database
 * This is the single source of truth for role fetching
 */
export async function fetchUserRolesFromDB(userId: string) {
  const supabase = await createClient()

  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('role_id, school_id, grade_id')
    .eq('user_id', userId)

  if (error || !userRoles?.length) {
    return createDefaultUserRoleInfo(userId)
  }

  const roles = userRoles.map(ur => ur.role_id as ERole)

  // Get school_id and grade_id from the first role entry (assuming they're consistent)
  // In practice, you might want to handle multiple schools/grades per user differently
  const firstRole = userRoles[0]
  const schoolId = firstRole.school_id!
  const gradeId = firstRole.grade_id

  return createUserRoleInfo(userId, roles, schoolId, gradeId)
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
    .select('role_id, school_id, grade_id')
    .eq('user_id', userId)

  if (error || !userRoles?.length) {
    return createDefaultUserRoleInfo(userId)
  }

  const roles = userRoles.map(ur => ur.role_id as ERole)

  // Get school_id and grade_id from the first role entry
  const firstRole = userRoles[0]
  const schoolId = firstRole.school_id
  const gradeId = firstRole.grade_id

  return createUserRoleInfo(userId, roles, schoolId, gradeId)
}
