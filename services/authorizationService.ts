'use server'

import type { AuthorizationResult, UserRoleInfo } from '@/lib/types/auth'
import { getCachedUserRoles } from '@/lib/cache/roleCache'
import { fetchUserRolesFromDB } from '@/lib/services/roleService'
import { ROLE_DASHBOARDS } from '@/lib/types/auth'
import { getRoleDisplayName as getRoleDisplayNameUtil } from '@/lib/utils/roleUtils'
import { ERole } from '@/types'

/**
 * Fetches all roles for a given user (cached version)
 * Uses the cache layer for better performance
 */
export async function getUserRolesCached(userId: string): Promise<UserRoleInfo | undefined> {
  try {
    const cachedRole = await getCachedUserRoles(userId)
    if (!cachedRole)
      throw new Error('Cached role not found')

    return cachedRole
  }
  catch (error) {
    console.error('Error fetching cached user roles:', error)
    // Fallback to direct DB query
    return getUserRoles(userId)
  }
}

/**
 * Fetches all roles for a given user (direct DB query)
 */
export async function getUserRoles(userId: string): Promise<UserRoleInfo> {
  return fetchUserRolesFromDB(userId)
}

/**
 * Checks if user is authorized to access the director dashboard
 */
export async function checkDirectorAccess(userId: string): Promise<AuthorizationResult> {
  const roleInfo = await getUserRoles(userId)

  if (roleInfo.hasDirectorAccess) {
    return {
      isAuthorized: true,
      userRole: ERole.DIRECTOR,
      redirectTo: '/t/home',
    }
  }

  // Determine appropriate redirect based on user's role
  if (roleInfo.hasTeacherAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.TEACHER,
      redirectTo: '/unauthorized',
      message: 'Accès réservé aux directeurs. Votre compte enseignant ne dispose pas des permissions nécessaires.',
    }
  }

  if (roleInfo.hasParentAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.PARENT,
      redirectTo: '/unauthorized',
      message: 'Accès réservé aux directeurs. Votre compte parent ne dispose pas des permissions nécessaires.',
    }
  }

  // User has no roles
  return {
    isAuthorized: false,
    userRole: null,
    redirectTo: '/unauthorized',
    message: 'Aucun rôle assigné à votre compte. Veuillez contacter l\'administrateur.',
  }
}

/**
 * Determines the appropriate redirect destination after successful authentication
 */
export async function getPostAuthRedirect(userId: string): Promise<AuthorizationResult> {
  const roleInfo = await getUserRoles(userId)

  // Priority-based routing based on primary role
  if (roleInfo.hasDirectorAccess) {
    return {
      isAuthorized: true,
      userRole: ERole.DIRECTOR,
      redirectTo: ROLE_DASHBOARDS[ERole.DIRECTOR],
    }
  }

  // Accountant dashboard - now enabled
  if (roleInfo.hasAccountantAccess) {
    return {
      isAuthorized: true,
      userRole: ERole.ACCOUNTANT,
      redirectTo: ROLE_DASHBOARDS[ERole.ACCOUNTANT],
    }
  }

  // Cashier dashboard - now enabled
  if (roleInfo.hasCashierAccess) {
    return {
      isAuthorized: true,
      userRole: ERole.CASHIER,
      redirectTo: ROLE_DASHBOARDS[ERole.CASHIER],
    }
  }

  // Educator dashboard - now enabled
  if (roleInfo.hasEducatorAccess) {
    return {
      isAuthorized: true,
      userRole: ERole.EDUCATOR,
      redirectTo: ROLE_DASHBOARDS[ERole.EDUCATOR],
    }
  }

  // Teacher dashboard - still in development
  if (roleInfo.hasTeacherAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.TEACHER,
      redirectTo: ROLE_DASHBOARDS[ERole.TEACHER],
      message: 'Interface enseignant en cours de développement.',
    }
  }

  // Parent dashboard - still in development
  if (roleInfo.hasParentAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.PARENT,
      redirectTo: ROLE_DASHBOARDS[ERole.PARENT],
      message: 'Interface parent en cours de développement.',
    }
  }

  // Headmaster dashboard - still in development
  if (roleInfo.hasHeadmasterAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.HEADMASTER,
      redirectTo: ROLE_DASHBOARDS[ERole.HEADMASTER],
      message: 'Interface proviseur en cours de développement.',
    }
  }

  // No valid roles
  return {
    isAuthorized: false,
    userRole: null,
    redirectTo: '/unauthorized',
    message: 'Aucun rôle valide trouvé pour votre compte. Veuillez contacter l\'administrateur système.',
  }
}

/**
 * Utility method to get user role display name
 */
export async function getRoleDisplayName(role: ERole | null): Promise<string> {
  return getRoleDisplayNameUtil(role)
}
