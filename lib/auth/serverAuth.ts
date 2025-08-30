'use server'

import { getUserRoles } from '@/services/authorizationService'
import { getUserId } from '@/services/userService'
import { ERole } from '@/types'
import { handleUnauthorized } from './unauthorized'

/**
 * Server-side authentication and authorization utilities
 * These should be used in server components and layouts to protect routes
 */

/**
 * Ensures user is authenticated and returns their userId
 * Redirects to sign-in if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getUserId()

  if (!userId) {
    handleUnauthorized('Authentication required', '/sign-in')
  }

  return userId
}

/**
 * Ensures user has the specified role
 * Redirects to appropriate page if not authorized
 */
export async function requireRole(requiredRole: ERole, customMessage?: string): Promise<void> {
  const userId = await requireAuth()
  const roleInfo = await getUserRoles(userId)

  const hasRequiredRole = roleInfo.roles.includes(requiredRole)

  if (!hasRequiredRole) {
    const roleNames: Record<ERole, string> = {
      [ERole.DIRECTOR]: 'Directeur',
      [ERole.TEACHER]: 'Enseignant',
      [ERole.PARENT]: 'Parent',
      [ERole.CASHIER]: 'Caissier / Caissière',
      [ERole.EDUCATOR]: 'Éducateur',
      [ERole.ACCOUNTANT]: 'Comptable',
      [ERole.HEADMASTER]: 'Proviseur',
    }

    const message = customMessage || `Accès réservé aux ${roleNames[requiredRole]}s. Votre compte ne dispose pas des permissions nécessaires.`
    handleUnauthorized(message)
  }
}

/**
 * Ensures user has director access specifically
 * This is commonly used throughout the app
 */
export async function requireDirectorAccess(): Promise<void> {
  await requireRole(ERole.DIRECTOR, 'Accès réservé aux directeurs.')
}

/**
 * Ensures user has accountant access
 */
export async function requireAccountantAccess(): Promise<void> {
  await requireRole(ERole.ACCOUNTANT, 'Accès réservé aux comptables.')
}

/**
 * Ensures user has cashier access
 */
export async function requireCashierAccess(): Promise<void> {
  await requireRole(ERole.CASHIER, 'Accès réservé aux caissiers et caissières.')
}

/**
 * Ensures user has educator access
 */
export async function requireEducatorAccess(): Promise<void> {
  await requireRole(ERole.EDUCATOR, 'Accès réservé aux éducateurs.')
}

/**
 * Gets current user info for server components
 * Returns null if not authenticated (doesn't redirect)
 */
export async function getCurrentUser() {
  try {
    const userId = await getUserId()
    if (!userId)
      return null

    const roleInfo = await getUserRoles(userId)
    return roleInfo
  }
  catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Checks if current user has specific role without redirecting
 * Useful for conditional rendering in server components
 */
export async function hasRole(requiredRole: ERole): Promise<boolean> {
  try {
    const userId = await getUserId()
    if (!userId)
      return false

    const roleInfo = await getUserRoles(userId)
    return roleInfo.roles.includes(requiredRole)
  }
  catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

/**
 * Gets the appropriate dashboard redirect for a user based on their primary role
 */
export async function getDashboardRedirect(): Promise<string> {
  try {
    const userId = await requireAuth()
    const roleInfo = await getUserRoles(userId)

    // Priority-based routing
    if (roleInfo.hasDirectorAccess) {
      return '/t/home'
    }

    // Return role-specific dashboards
    if (roleInfo.roles.includes(ERole.ACCOUNTANT)) {
      return '/accountant'
    }

    if (roleInfo.roles.includes(ERole.CASHIER)) {
      return '/cashier'
    }

    if (roleInfo.roles.includes(ERole.EDUCATOR)) {
      return '/educator'
    }

    // Fallback for unsupported roles
    if (roleInfo.roles.includes(ERole.TEACHER)) {
      handleUnauthorized('Interface enseignant en cours de développement.')
    }

    if (roleInfo.roles.includes(ERole.PARENT)) {
      handleUnauthorized('Interface parent en cours de développement.')
    }

    if (roleInfo.roles.includes(ERole.HEADMASTER)) {
      handleUnauthorized('Interface proviseur en cours de développement.')
    }

    // No valid roles
    handleUnauthorized('Aucun rôle valide trouvé pour votre compte.')
  }
  catch (error) {
    console.error('Error getting dashboard redirect:', error)
    handleUnauthorized('Erreur lors de la vérification des permissions.')
  }
}
