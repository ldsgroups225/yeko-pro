import type { SupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

export interface AuthorizationContext {
  userId: string
  schoolId: string
  hasDirectorAccess: boolean
}

export interface UserSchoolInfo {
  id: string
  name: string
  code: string
  roleId: ERole
  roleName?: string
  schoolYear?: { id: number, end_year: number }
}

export interface SchoolAccessOptions {
  /**
   * Whether to include role name in the response
   * @default false
   */
  includeRoleName?: boolean
}

// For backward compatibility
export type SchoolInfo = Omit<UserSchoolInfo, 'roleId' | 'roleName'>

/**
 * Base authorization service for role-based access control
 */
export class AuthorizationService {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  /**
   * Get authenticated user ID
   */
  async getAuthenticatedUserId(): Promise<string> {
    const { data: user, error } = await this.client.auth.getUser()
    if (error) {
      return redirect('/unauthorized')
    }
    return user.user.id
  }

  /**
   * Verify user has director access to a specific school
   */
  async verifyDirectorAccess(userId: string, schoolId: string): Promise<AuthorizationContext> {
    const { data: userRole, error } = await this.client
      .from('user_roles')
      .select('school_id, role_id')
      .eq('user_id', userId)
      .eq('school_id', schoolId)
      .eq('role_id', ERole.DIRECTOR)
      .single()

    if (error || !userRole) {
      return redirect('/unauthorized')
    }

    return {
      userId,
      schoolId,
      hasDirectorAccess: true,
    }
  }

  /**
   * Get user's school information with role-based access control
   * @param userId The ID of the user to check
   * @param options Configuration options for the query
   * @returns School information with role context if user has access
   * @throws Redirects to /unauthorized if access is denied
   */
  async getUserSchoolInfo(
    userId: string,
    options: SchoolAccessOptions & { roleId?: ERole, withSchoolYear?: boolean } = {},
  ): Promise<UserSchoolInfo> {
    const {
      roleId,
      includeRoleName = false,
      withSchoolYear = false,
    } = options

    // Build the base query
    let query = this.client
      .from('user_roles')
      .select(`
        id,
        role_id,
        school_id,
        schools!user_roles_school_id_fkey(
          id,
          name,
          code
        )
      `)
      .eq('user_id', userId)

    // Filter by role if specified
    if (roleId) {
      query = query.eq('role_id', roleId)
    }

    // Execute the query simultaneously with school year if requested
    const { data: userRole, error } = await query.single()

    if (error || !userRole?.school_id || !userRole.schools) {
      return redirect('/unauthorized')
    }

    // Get role name if requested
    let roleName: string | undefined
    if (includeRoleName && userRole.role_id) {
      const { getRoleDisplayName } = await import('@/lib/utils/roleUtils')
      roleName = getRoleDisplayName(userRole.role_id)
    }

    // Get school year if requested
    let schoolYear: { id: number, end_year: number } | undefined
    if (withSchoolYear) {
      const { data: schoolYearData, error: schoolYearError } = await this.client
        .from('school_years')
        .select('id, end_year')
        .is('is_current', true)
        .single()

      if (schoolYearError || !schoolYearData) {
        return redirect('/unauthorized')
      }

      schoolYear = schoolYearData
    }

    return {
      id: userRole.school_id,
      name: userRole.schools.name,
      code: userRole.schools.code,
      roleId: userRole.role_id,
      ...(roleName && { roleName }),
      ...(schoolYear && { schoolYear }),
    }
  }

  /**
   * @deprecated Use getUserSchoolInfo instead
   * Get director's school information (maintained for backward compatibility)
   */
  async getDirectorSchoolInfo(
    userId: string,
    requiredRole: ERole = ERole.DIRECTOR,
  ): Promise<SchoolInfo> {
    const schoolInfo = await this.getUserSchoolInfo(userId, {
      roleId: requiredRole,
      includeRoleName: false,
    })

    // Return only the legacy fields
    const { roleId, roleName, ...legacyInfo } = schoolInfo
    return legacyInfo
  }

  /**
   * Check if user is the last director in a school
   */
  async isLastDirector(userId: string, schoolId: string): Promise<boolean> {
    const { data: directors } = await this.client
      .from('user_roles')
      .select('user_id')
      .eq('school_id', schoolId)
      .eq('role_id', ERole.DIRECTOR)

    return directors ? directors.length <= 1 && directors[0].user_id === userId : false
  }
}

/**
 * Factory function to create authorization service
 */
export async function createAuthorizationService(): Promise<AuthorizationService> {
  const client = await createClient()
  return new AuthorizationService(client)
}
