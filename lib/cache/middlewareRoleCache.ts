import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { createServerClient } from '@supabase/ssr'
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

// Simple in-memory cache for middleware
// Note: This cache is per-worker and will be cleared on deployment
const roleCache = new Map<string, { data: CachedUserRole, expiresAt: number }>()

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Fetches user roles directly from Supabase (middleware-compatible)
 */
export async function fetchUserRolesFromDBMiddleware(
  userId: string,
  cookies: RequestCookie[],
  supabaseUrl: string,
  supabaseAnonKey: string,
): Promise<CachedUserRole> {
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookies
        },
        setAll() {
          // We don't set cookies in this context
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
 * Get cached user roles with middleware-compatible caching
 */
export async function getCachedUserRolesMiddleware(
  userId: string,
  cookies: RequestCookie[],
  supabaseUrl: string,
  supabaseAnonKey: string,
): Promise<CachedUserRole> {
  // Check in-memory cache first
  const cached = roleCache.get(userId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  // Fetch from database
  const roleData = await fetchUserRolesFromDBMiddleware(
    userId,
    cookies,
    supabaseUrl,
    supabaseAnonKey,
  )

  // Store in cache
  roleCache.set(userId, {
    data: roleData,
    expiresAt: Date.now() + CACHE_DURATION,
  })

  // Clean up old entries if cache gets too large
  if (roleCache.size > 1000) {
    const now = Date.now()
    roleCache.forEach((value, key) => {
      if (value.expiresAt < now) {
        roleCache.delete(key)
      }
    })
  }

  return roleData
}

/**
 * Lightweight check for director access (middleware-compatible)
 */
export async function getCachedDirectorAccessMiddleware(
  userId: string,
  cookies: RequestCookie[],
  supabaseUrl: string,
  supabaseAnonKey: string,
): Promise<boolean> {
  const roleInfo = await getCachedUserRolesMiddleware(
    userId,
    cookies,
    supabaseUrl,
    supabaseAnonKey,
  )
  return roleInfo.hasDirectorAccess
}

/**
 * Clear cache for a specific user
 */
export function clearUserRoleCache(userId: string) {
  roleCache.delete(userId)
}

/**
 * Clear entire cache
 */
export function clearAllRoleCache() {
  roleCache.clear()
}
