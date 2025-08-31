import type { SupabaseClient } from '@/lib/supabase/server'
import type { ERole } from '@/types'
import { createClient } from '@/lib/supabase/server'

export interface UserRoleAssignment {
  userId: string
  roleId: ERole
  schoolId: string
  gradeId?: number | null
}

export interface UserRoleUpdate {
  userId: string
  newRole: ERole
  schoolId: string
}

/**
 * User role management service
 */
export class UserRoleService {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  /**
   * Assign role to user
   */
  async assignRole(assignment: UserRoleAssignment): Promise<void> {
    const { error } = await this.client
      .from('user_roles')
      .insert({
        user_id: assignment.userId,
        role_id: assignment.roleId,
        school_id: assignment.schoolId,
        grade_id: assignment.gradeId,
      })

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`)
    }
  }

  /**
   * Update user role
   */
  async updateRole(update: UserRoleUpdate): Promise<void> {
    // Remove existing roles for this user in this school
    const { error: deleteError } = await this.client
      .from('user_roles')
      .delete()
      .eq('user_id', update.userId)
      .eq('school_id', update.schoolId)

    if (deleteError) {
      throw new Error(`Failed to remove existing roles: ${deleteError.message}`)
    }

    // Add new role
    const { error: insertError } = await this.client
      .from('user_roles')
      .insert({
        user_id: update.userId,
        role_id: update.newRole,
        school_id: update.schoolId,
      })

    if (insertError) {
      throw new Error(`Failed to assign new role: ${insertError.message}`)
    }
  }

  /**
   * Remove user roles from school
   */
  async removeUserFromSchool(userId: string, schoolId: string): Promise<void> {
    const { error } = await this.client
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('school_id', schoolId)

    if (error) {
      throw new Error(`Failed to remove user roles: ${error.message}`)
    }
  }

  /**
   * Get user roles in school
   */
  async getUserRolesInSchool(userId: string, schoolId: string): Promise<ERole[]> {
    const { data, error } = await this.client
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('school_id', schoolId)

    if (error) {
      throw new Error(`Failed to get user roles: ${error.message}`)
    }

    return data?.map(role => role.role_id as ERole) || []
  }
}

/**
 * Factory function to create user role service
 */
export async function createUserRoleService(): Promise<UserRoleService> {
  const client = await createClient()
  return new UserRoleService(client)
}
