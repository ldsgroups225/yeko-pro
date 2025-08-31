import type { UserRoleInfo } from '@/lib/types/auth'
import { ROLE_DISPLAY_NAMES, ROLE_PRIORITY } from '@/lib/types/auth'
import { ERole } from '@/types'

/**
 * Determines the primary role based on priority
 * Higher priority roles take precedence
 */
export function determinePrimaryRole(roles: ERole[]): ERole | null {
  if (!roles.length)
    return null

  // Find the highest priority role that the user has
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role
    }
  }

  return null
}

/**
 * Creates a UserRoleInfo object from roles array
 */
export function createUserRoleInfo(
  userId: string,
  roles: ERole[],
  schoolId: string,
  gradeId: number | null = null,
): UserRoleInfo {
  const primaryRole = determinePrimaryRole(roles)

  return {
    userId,
    roles,
    primaryRole,
    hasDirectorAccess: roles.includes(ERole.DIRECTOR),
    hasTeacherAccess: roles.includes(ERole.TEACHER),
    hasParentAccess: roles.includes(ERole.PARENT),
    hasEducatorAccess: roles.includes(ERole.EDUCATOR),
    hasAccountantAccess: roles.includes(ERole.ACCOUNTANT),
    hasCashierAccess: roles.includes(ERole.CASHIER),
    hasHeadmasterAccess: roles.includes(ERole.HEADMASTER),
    schoolId,
    gradeId,
    cachedAt: Date.now(),
  }
}

/**
 * Gets role display name
 */
export function getRoleDisplayName(role: ERole | null): string {
  if (!role)
    return 'Aucun rôle'
  return ROLE_DISPLAY_NAMES[role] || 'Rôle inconnu'
}

/**
 * Creates default UserRoleInfo for users with no roles
 */
export function createDefaultUserRoleInfo(userId: string): UserRoleInfo {
  return {
    userId,
    roles: [],
    primaryRole: null,
    hasDirectorAccess: false,
    hasTeacherAccess: false,
    hasParentAccess: false,
    hasEducatorAccess: false,
    hasAccountantAccess: false,
    hasCashierAccess: false,
    hasHeadmasterAccess: false,
    schoolId: '',
    gradeId: null,
    cachedAt: Date.now(),
  }
}
