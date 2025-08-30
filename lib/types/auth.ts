import { ERole } from '@/types'

/**
 * Base interface for user role information
 * Used across all authorization services
 */
export interface UserRoleInfo {
  userId: string
  roles: ERole[]
  primaryRole: ERole | null
  hasDirectorAccess: boolean
  hasTeacherAccess: boolean
  hasParentAccess: boolean
  hasEducatorAccess: boolean
  hasAccountantAccess: boolean
  hasCashierAccess: boolean
  hasHeadmasterAccess: boolean
  cachedAt?: number
}

/**
 * Authorization result for post-auth redirects
 */
export interface AuthorizationResult {
  isAuthorized: boolean
  userRole: ERole | null
  redirectTo: string
  message?: string
}

/**
 * Role display names mapping
 */
export const ROLE_DISPLAY_NAMES: Record<ERole, string> = {
  [ERole.DIRECTOR]: 'Directeur',
  [ERole.TEACHER]: 'Enseignant',
  [ERole.PARENT]: 'Parent',
  [ERole.CASHIER]: 'Caissier / Caissière',
  [ERole.EDUCATOR]: 'Éducateur',
  [ERole.ACCOUNTANT]: 'Comptable',
  [ERole.HEADMASTER]: 'Proviseur',
}

/**
 * Role priority for determining primary role
 * Higher index = higher priority
 */
export const ROLE_PRIORITY: ERole[] = [
  ERole.HEADMASTER,
  ERole.PARENT,
  ERole.TEACHER,
  ERole.EDUCATOR,
  ERole.CASHIER,
  ERole.ACCOUNTANT,
  ERole.DIRECTOR,
]

/**
 * Dashboard redirects for each role
 */
export const ROLE_DASHBOARDS: Record<ERole, string> = {
  [ERole.DIRECTOR]: '/t/home',
  [ERole.ACCOUNTANT]: '/accountant',
  [ERole.CASHIER]: '/cashier',
  [ERole.EDUCATOR]: '/educator',
  [ERole.TEACHER]: '/unauthorized', // In development
  [ERole.PARENT]: '/unauthorized', // In development
  [ERole.HEADMASTER]: '/unauthorized', // In development
}
