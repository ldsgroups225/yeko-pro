import { createServerClient } from '@supabase/ssr'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'
import { ERole } from '@/types'

export interface CachedUserRole {
  userId: string
  roles: ERole[]
  primaryRole: ERole | null
  hasDirectorAccess: boolean
  hasTeacherAccess: boolean
  hasParentAccess: boolean
  cachedAt: number
}

/**
 * Fetches user roles directly from Supabase (used by cached function)
 */
async function fetchUserRolesFromDB(userId: string): Promise<CachedUserRole | undefined> {
  const env = getEnvOrThrowServerSide()
  const cookieStore = await cookies()

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

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
      cachedAt: Date.now(),
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
    cachedAt: Date.now(),
  }
}

/**
 * Cached version of user roles fetching
 * Cache duration: 5 minutes (300 seconds)
 */
export const getCachedUserRoles = unstable_cache(
  fetchUserRolesFromDB,
  ['user-roles'],
  {
    revalidate: 300, // 5 minutes
    tags: ['user-roles'],
  },
)

/**
 * Lightweight role check specifically for middleware
 * Only checks if user has director access (simplified for performance)
 */
export const getCachedDirectorAccess = unstable_cache(
  async (userId: string): Promise<boolean> => {
    const roleInfo = await fetchUserRolesFromDB(userId)
    return roleInfo?.hasDirectorAccess || false
  },
  ['director-access'],
  {
    revalidate: 300, // 5 minutes
    tags: ['user-roles', 'director-access'],
  },
)

/**
 * Get role display name from cached data
 */
export function getRoleDisplayNameFromCache(role: ERole | null): string {
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
    // [ERole.SUPER_ADMIN]: 'Super Admin',
  }

  return roleNames[role] || 'Rôle inconnu'
}

/**
 * Invalidate user role cache (call this when user roles are updated)
 */
export async function invalidateUserRoleCache(userId?: string) {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('user-roles')
  if (userId) {
    revalidateTag(`user-roles-${userId}`)
  }
}
