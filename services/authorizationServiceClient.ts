'use client'

import { ERole } from '@/types'

export interface AuthorizationResult {
  isAuthorized: boolean
  userRole: ERole | null
  redirectTo: string
  message?: string
}

/**
 * Client-side authorization service methods
 * These are wrappers that call server actions
 */
export class AuthorizationServiceClient {
  /**
   * Determines the appropriate redirect destination after successful authentication
   * Client-side wrapper for server action
   */
  static async getPostAuthRedirect(userId: string): Promise<AuthorizationResult> {
    try {
      // Import the server action dynamically
      const { getPostAuthRedirect } = await import('./authorizationService')
      return await getPostAuthRedirect(userId)
    }
    catch (error) {
      console.error('Error in getPostAuthRedirect:', error)
      return {
        isAuthorized: false,
        userRole: null,
        redirectTo: '/unauthorized',
        message: 'Erreur lors de la vérification des permissions. Veuillez réessayer.',
      }
    }
  }

  /**
   * Get user role display name
   */
  static getRoleDisplayName(role: ERole | null): string {
    if (!role)
      return 'Aucun rôle'

    const roleNames: Record<ERole, string> = {
      [ERole.DIRECTOR]: 'Directeur',
      [ERole.TEACHER]: 'Enseignant',
      [ERole.PARENT]: 'Parent',
    }

    return roleNames[role] || 'Rôle inconnu'
  }
}
