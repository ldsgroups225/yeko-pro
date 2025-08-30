import { unstable_cache } from 'next/cache'
import { fetchUserRolesFromDB } from '@/lib/services/roleService'

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
 * Invalidate user role cache (call this when user roles are updated)
 */
export async function invalidateUserRoleCache(userId?: string) {
  const { revalidateTag } = await import('next/cache')
  revalidateTag('user-roles')
  if (userId) {
    revalidateTag(`user-roles-${userId}`)
  }
}
