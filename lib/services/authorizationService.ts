import type { SupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

export interface AuthorizationContext {
  userId: string
  schoolId: string
  hasDirectorAccess: boolean
}

export interface SchoolInfo {
  id: string
  name: string
  code: string
}

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
      throw new Error('Authentication required')
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
      throw new Error('Unauthorized: Director access required')
    }

    return {
      userId,
      schoolId,
      hasDirectorAccess: true,
    }
  }

  /**
   * Get director's school information
   */
  async getDirectorSchoolInfo(userId: string): Promise<SchoolInfo> {
    const { data: userRole, error } = await this.client
      .from('user_roles')
      .select(`
        school_id,
        schools!user_roles_school_id_fkey(id, name, code)
      `)
      .eq('user_id', userId)
      .eq('role_id', ERole.DIRECTOR)
      .single()

    if (error || !userRole?.school_id || !userRole.schools) {
      throw new Error('Director access required')
    }

    return {
      id: userRole.school_id,
      name: userRole.schools.name,
      code: userRole.schools.code,
    }
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
