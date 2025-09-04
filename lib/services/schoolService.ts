import type { SupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

export interface SchoolMember {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  fullName: string
  avatarUrl: string | null
  roles: ERole[]
  grade: number | null
  primaryRole: ERole | null
  createdAt: string
  lastActiveAt: string | null
}

export interface SchoolMemberQuery {
  schoolId: string
  excludeRoles?: ERole[]
}

/**
 * School management service
 */
export class SchoolService {
  private client: SupabaseClient

  constructor(client: SupabaseClient) {
    this.client = client
  }

  /**
   * Get school members with optional role filtering
   */
  async getSchoolMembers(query: SchoolMemberQuery): Promise<SchoolMember[]> {
    const { schoolId, excludeRoles = [ERole.PARENT, ERole.TEACHER] } = query

    // Build the query: fetch all user roles + user details
    const { data: allMembers, error } = await this.client
      .from('user_roles')
      .select(`
      user_id,
      role_id,
      grade_id,
      users!user_roles_user_id_fkey(
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        created_at,
        updated_at
      )
    `)
      .eq('school_id', schoolId)
      .not('role_id', 'in', `(${excludeRoles.join(',')})`)

    if (error) {
      throw new Error(`Failed to fetch school members: ${error.message}`)
    }

    if (!allMembers)
      return []

    // Group users by user_id and collect their roles
    const userMap = new Map<string, { user: any, roles: ERole[], grade: number | null }>()

    for (const member of allMembers) {
      const userId = member.user_id
      const role = member.role_id as ERole
      const grade = member.grade_id
      const user = member.users

      if (!userMap.has(userId)) {
        userMap.set(userId, { user, roles: [], grade })
      }
      userMap.get(userId)!.roles.push(role)
    }

    // Filter out users who only have excluded roles
    const relevantMembers = Array.from(userMap.values()).filter(({ roles }) =>
      roles.some(role => !excludeRoles.includes(role)),
    )

    // Transform into SchoolMember objects
    return relevantMembers.map(({ user, roles, grade }) => {
      const uniqueRoles = Array.from(new Set(roles))
      const primaryRole = uniqueRoles.includes(ERole.DIRECTOR)
        ? ERole.DIRECTOR
        : uniqueRoles[0] ?? null

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        avatarUrl: user.avatar_url,
        roles: uniqueRoles,
        grade,
        primaryRole,
        createdAt: user.created_at ?? new Date().toISOString(),
        lastActiveAt: user.updated_at,
      }
    })
  }

  /**
   * Check if user exists in school
   */
  async isUserInSchool(userId: string, schoolId: string): Promise<boolean> {
    const { data } = await this.client
      .from('user_roles')
      .select('user_id')
      .eq('user_id', userId)
      .eq('school_id', schoolId)
      .single()

    return !!data
  }
}

/**
 * Factory function to create school service
 */
export async function createSchoolService(): Promise<SchoolService> {
  const client = await createClient()
  return new SchoolService(client)
}
