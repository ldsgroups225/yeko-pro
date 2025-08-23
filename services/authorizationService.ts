'use server'

import { getCachedUserRoles } from '@/lib/cache/roleCache'
import { createClient } from '@/lib/supabase/server'
import { ERole } from '@/types'

export interface AuthorizationResult {
  isAuthorized: boolean
  userRole: ERole | null
  redirectTo: string
  message?: string
}

export interface UserRoleInfo {
  userId: string
  roles: ERole[]
  primaryRole: ERole | null
  hasDirectorAccess: boolean
  hasTeacherAccess: boolean
  hasParentAccess: boolean
}

/**
 * Fetches all roles for a given user (cached version)
 * Uses the cache layer for better performance
 */
export async function getUserRolesCached(userId: string): Promise<UserRoleInfo | undefined> {
  try {
    const cachedRole = await getCachedUserRoles(userId)
    if (!cachedRole)
      throw new Error('Cached role not found')

    return {
      userId: cachedRole.userId,
      roles: cachedRole.roles,
      primaryRole: cachedRole.primaryRole,
      hasDirectorAccess: cachedRole.hasDirectorAccess,
      hasTeacherAccess: cachedRole.hasTeacherAccess,
      hasParentAccess: cachedRole.hasParentAccess,
    }
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
  const supabase = await createClient()

  const { data: userRoles, error } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)

  if (error || !userRoles?.length) {
    return {
      userId,
      roles: [],
      primaryRole: null,
      hasDirectorAccess: false,
      hasTeacherAccess: false,
      hasParentAccess: false,
    }
  }

  const roles = userRoles.map(ur => ur.role_id as ERole)

  // Determine primary role (highest priority: Director > Teacher > Parent)
  const primaryRole = roles.includes(ERole.DIRECTOR)
    ? ERole.DIRECTOR
    : roles.includes(ERole.TEACHER)
      ? ERole.TEACHER
      : roles.includes(ERole.PARENT)
        ? ERole.PARENT
        : null

  return {
    userId,
    roles,
    primaryRole,
    hasDirectorAccess: roles.includes(ERole.DIRECTOR),
    hasTeacherAccess: roles.includes(ERole.TEACHER),
    hasParentAccess: roles.includes(ERole.PARENT),
  }
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

  // Priority-based routing
  if (roleInfo.hasDirectorAccess) {
    return {
      isAuthorized: true,
      userRole: ERole.DIRECTOR,
      redirectTo: '/t/home',
    }
  }

  // For future expansion - teacher dashboard
  if (roleInfo.hasTeacherAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.TEACHER,
      redirectTo: '/unauthorized',
      message: 'Interface enseignant en cours de développement. Seuls les directeurs peuvent accéder à l\'application pour le moment.',
    }
  }

  // For future expansion - parent dashboard
  if (roleInfo.hasParentAccess) {
    return {
      isAuthorized: false,
      userRole: ERole.PARENT,
      redirectTo: '/unauthorized',
      message: 'Interface parent en cours de développement. Seuls les directeurs peuvent accéder à l\'application pour le moment.',
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
  if (!role)
    return 'Aucun rôle'

  const roleNames: Record<ERole, string> = {
    [ERole.DIRECTOR]: 'Directeur',
    [ERole.TEACHER]: 'Enseignant',
    [ERole.PARENT]: 'Parent',
    [ERole.CASHIER]: 'Caissier / Caissière',
    [ERole.EDUCATOR]: 'Éducateur',
    [ERole.ACCOUNTANT]: 'Comptable',
    [ERole.HEADMASTER]: 'Proviseur',
  }

  return roleNames[role] || 'Rôle inconnu'
}
