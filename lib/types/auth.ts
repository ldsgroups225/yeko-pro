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
  // School and grade information from user_roles table
  schoolId: string
  gradeId: number | null
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
 * HEADMASTER > DIRECTOR > EDUCATOR > TEACHER > ACCOUNTANT > CASHIER > PARENT
 */
export const ROLE_PRIORITY: ERole[] = [
  ERole.HEADMASTER,
  ERole.DIRECTOR,
  ERole.EDUCATOR,
  ERole.TEACHER,
  ERole.ACCOUNTANT,
  ERole.CASHIER,
  ERole.PARENT,
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
