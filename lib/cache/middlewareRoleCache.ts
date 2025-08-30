import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import type { UserRoleInfo } from '@/lib/types/auth'
import { fetchUserRolesFromDBMiddleware } from '@/lib/services/roleService'

// Simple in-memory cache for middleware
// Note: This cache is per-worker and will be cleared on deployment
const roleCache = new Map<string, { data: UserRoleInfo, expiresAt: number }>()

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

/**
 * Get cached user roles with middleware-compatible caching
 */
export async function getCachedUserRolesMiddleware(
  userId: string,
  cookies: RequestCookie[],
  supabaseUrl: string,
  supabaseAnonKey: string,
): Promise<UserRoleInfo> {
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
 * Lightweight check for educator access (middleware-compatible)
 */
export async function getCachedEducatorAccessMiddleware(
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
  return roleInfo.hasEducatorAccess
}

/**
 * Lightweight check for accountant access (middleware-compatible)
 */
export async function getCachedAccountantAccessMiddleware(
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
  return roleInfo.hasAccountantAccess
}

/**
 * Lightweight check for cashier access (middleware-compatible)
 */
export async function getCachedCashierAccessMiddleware(
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
  return roleInfo.hasCashierAccess
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
