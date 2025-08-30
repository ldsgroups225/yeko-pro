import type { NextRequest } from 'next/server'
import { getCachedDirectorAccessMiddleware, getCachedUserRolesMiddleware } from '@/lib/cache/middlewareRoleCache'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'
import { ERole } from '@/types'

export interface MiddlewareAuthResult {
  isAuthenticated: boolean
  userId: string | null
  hasDirectorAccess: boolean
  shouldRedirect: boolean
  redirectTo: string | null
  reason?: string
}

/**
 * Determines if a path requires authentication
 */
export function isAuthRequiredPath(pathname: string): boolean {
  // Paths that require authentication
  const authRequiredPaths = ['/t/', '/accountant', '/cashier', '/educator']

  // Check if path requires auth
  return authRequiredPaths.some(path => pathname.startsWith(path))
}

/**
 * Determines if a path requires director access specifically
 */
export function isDirectorOnlyPath(pathname: string): boolean {
  const directorPaths = ['/t/']
  return directorPaths.some(path => pathname.startsWith(path))
}

/**
 * Determines if a path requires accountant access
 */
export function isAccountantOnlyPath(pathname: string): boolean {
  return pathname.startsWith('/accountant')
}

/**
 * Determines if a path requires cashier access
 */
export function isCashierOnlyPath(pathname: string): boolean {
  return pathname.startsWith('/cashier')
}

/**
 * Determines if a path requires educator access
 */
export function isEducatorOnlyPath(pathname: string): boolean {
  return pathname.startsWith('/educator')
}

/**
 * Returns the appropriate redirect path based on user role
 */
export function getRoleBasedRedirect(role: ERole | null): string {
  switch (role) {
    case ERole.DIRECTOR:
      return '/t/home'
    case ERole.TEACHER:
      return '/unauthorized'
    case ERole.PARENT:
      return '/unauthorized'
    case ERole.EDUCATOR:
      return '/educator'
    case ERole.ACCOUNTANT:
      return '/accountant'
    case ERole.CASHIER:
      return '/cashier'
    case ERole.HEADMASTER:
      return '/unauthorized'
    default:
      return '/unauthorized'
  }
}

/**
 * Checks if authenticated user should be redirected from public pages
 */
export function shouldRedirectAuthenticatedUser(pathname: string): boolean {
  const publicAuthPages = [
    '/',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/auth/',
    '/error',
  ]

  const result = publicAuthPages.some((path) => {
    // Exact match for all paths
    if (pathname === path) {
      return true
    }

    // Prefix match only for paths that end with '/' and are not the root '/'
    if (path.endsWith('/') && path !== '/' && pathname.startsWith(path)) {
      return true
    }

    return false
  })

  return result
}

/**
 * Main middleware authentication logic with role-based access control
 */
export async function checkMiddlewareAuth(
  request: NextRequest,
  user: any,
): Promise<MiddlewareAuthResult> {
  const pathname = request.nextUrl.pathname

  // console.log('🚀 Middleware Auth Check:', {
  //   pathname,
  //   hasUser: !!user,
  //   userId: user?.id,
  //   timestamp: new Date().toISOString(),
  // })

  // If no user, check if auth is required
  if (!user) {
    // console.log('🔍 No user found, checking if auth required for:', pathname)
    // Unauthorized page requires authentication (only authenticated non-directors can see it)
    if (pathname === '/unauthorized' || isAuthRequiredPath(pathname)) {
      // console.log('🔍 Auth required, redirecting to sign-in')
      return {
        isAuthenticated: false,
        userId: null,
        hasDirectorAccess: false,
        shouldRedirect: true,
        redirectTo: '/sign-in',
        reason: 'Authentication required',
      }
    }

    // console.log('🔍 No auth required, allowing access')
    return {
      isAuthenticated: false,
      userId: null,
      hasDirectorAccess: false,
      shouldRedirect: false,
      redirectTo: null,
    }
  }

  const userId = user.id

  // User is authenticated
  // console.log('🔍 User is authenticated, checking special cases')

  // Special case: /unauthorized page is ONLY for authenticated non-directors
  if (pathname === '/unauthorized') {
    // console.log('🔍 Checking /unauthorized page access')
    try {
      const env = getEnvOrThrowServerSide()
      const cookies = request.cookies.getAll()
      const hasDirectorAccess = await getCachedDirectorAccessMiddleware(
        userId,
        cookies,
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      if (hasDirectorAccess) {
        // Directors are forbidden from accessing /unauthorized page
        // Redirect them to their dashboard
        return {
          isAuthenticated: true,
          userId,
          hasDirectorAccess: true,
          shouldRedirect: true,
          redirectTo: '/t/home',
          reason: 'Directors cannot access unauthorized page',
        }
      }

      // Only authenticated non-directors can access the unauthorized page
      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: false,
        shouldRedirect: false,
        redirectTo: null,
      }
    }
    catch (error) {
      console.error('Error checking director access for unauthorized page:', error)
      // On error, redirect to sign-in for safety
      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: false,
        shouldRedirect: true,
        redirectTo: '/sign-in',
        reason: 'Error checking permissions for unauthorized page',
      }
    }
  }

  // Check if they should be redirected away from public pages
  // But skip this check for /t/* routes since those are protected, not public
  // console.log('🔍 Checking if should redirect from public pages:', {
  //   shouldRedirect: shouldRedirectAuthenticatedUser(pathname),
  //   isNotTRoute: !pathname.startsWith('/t/'),
  //   pathname,
  // })

  if (shouldRedirectAuthenticatedUser(pathname) && !pathname.startsWith('/t/')) {
    // console.log('🔍 Should redirect from public page')
    // Get user role to determine where to redirect
    try {
      const env = getEnvOrThrowServerSide()
      const cookies = request.cookies.getAll()
      const roleInfo = await getCachedUserRolesMiddleware(
        userId,
        cookies,
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: roleInfo.hasDirectorAccess,
        shouldRedirect: true,
        redirectTo: roleInfo.hasDirectorAccess ? '/t/home' : getRoleBasedRedirect(roleInfo.primaryRole),
        reason: roleInfo.hasDirectorAccess ? 'Redirect to dashboard' : 'Non-director user',
      }
    }
    catch (error) {
      console.error('Error checking user role in middleware:', error)
      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: false,
        shouldRedirect: true,
        redirectTo: '/unauthorized',
        reason: 'Role check failed',
      }
    }
  }

  // Check if user is trying to access director-only paths
  // console.log('🔍 Checking if director-only path:', {
  //   pathname,
  //   isDirectorOnly: isDirectorOnlyPath(pathname),
  // })

  if (isDirectorOnlyPath(pathname)) {
    // console.log('🔍 Is director-only path, checking director access')
    try {
      const env = getEnvOrThrowServerSide()
      const cookies = request.cookies.getAll()
      const hasDirectorAccess = await getCachedDirectorAccessMiddleware(
        userId,
        cookies,
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      if (!hasDirectorAccess) {
        return {
          isAuthenticated: true,
          userId,
          hasDirectorAccess: false,
          shouldRedirect: true,
          redirectTo: '/unauthorized',
          reason: 'Director access required',
        }
      }

      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: true,
        shouldRedirect: false,
        redirectTo: null,
      }
    }
    catch (error) {
      console.error('Error checking director access in middleware:', error)
      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: false,
        shouldRedirect: true,
        redirectTo: '/unauthorized',
        reason: 'Director access check failed',
      }
    }
  }

  // Check role-specific path access
  if (isAccountantOnlyPath(pathname) || isCashierOnlyPath(pathname) || isEducatorOnlyPath(pathname)) {
    // console.log('🔍 Entering role-specific path check for:', pathname)
    try {
      const env = getEnvOrThrowServerSide()
      const cookies = request.cookies.getAll()
      // console.log('🔍 About to fetch role info for user:', userId)
      const roleInfo = await getCachedUserRolesMiddleware(
        userId,
        cookies,
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )
      // console.log('🔍 Role info fetched successfully:', roleInfo)

      // Enhanced debug logging
      // console.log('🔍 Middleware Debug - Role-Specific Path Access:')
      // console.log('  Path:', pathname)
      // console.log('  User ID:', userId)
      // console.log('  User Roles:', roleInfo.roles)
      // console.log('  Primary Role:', roleInfo.primaryRole)
      // console.log('  Has Educator Access:', roleInfo.hasEducatorAccess)
      // console.log('  Has Accountant Access:', roleInfo.hasAccountantAccess)
      // console.log('  Has Cashier Access:', roleInfo.hasCashierAccess)
      // console.log('  Has Director Access:', roleInfo.hasDirectorAccess)
      // console.log('  ERole values:', {
      //   EDUCATOR: ERole.EDUCATOR,
      //   ACCOUNTANT: ERole.ACCOUNTANT,
      //   CASHIER: ERole.CASHIER,
      //   DIRECTOR: ERole.DIRECTOR,
      // })

      // Check specific role access
      let hasRequiredAccess = false
      let requiredRole = ''

      if (isAccountantOnlyPath(pathname)) {
        hasRequiredAccess = roleInfo.hasAccountantAccess
        requiredRole = 'comptable'
        // console.log('  Checking ACCOUNTANT access:', hasRequiredAccess)
      }
      else if (isCashierOnlyPath(pathname)) {
        hasRequiredAccess = roleInfo.hasCashierAccess
        requiredRole = 'caissier'
        // console.log('  Checking CASHIER access:', hasRequiredAccess)
      }
      else if (isEducatorOnlyPath(pathname)) {
        hasRequiredAccess = roleInfo.hasEducatorAccess
        requiredRole = 'éducateur'
        // console.log('  Checking EDUCATOR access:', hasRequiredAccess)
      }

      if (!hasRequiredAccess) {
        // Debug logging for failed access
        // console.log('❌ Role access denied:')
        // console.log('  Required role:', requiredRole)
        // console.log('  User roles:', roleInfo.roles)

        // Redirect to appropriate dashboard or unauthorized page
        const redirectTo = roleInfo.hasDirectorAccess
          ? '/t/home'
          : getRoleBasedRedirect(roleInfo.primaryRole)

        return {
          isAuthenticated: true,
          userId,
          hasDirectorAccess: roleInfo.hasDirectorAccess,
          shouldRedirect: true,
          redirectTo,
          reason: `Accès ${requiredRole} requis`,
        }
      }

      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: roleInfo.hasDirectorAccess,
        shouldRedirect: false,
        redirectTo: null,
      }
    }
    catch {
      // console.error('❌ Error checking role-specific access in middleware:', error)
      // console.error('❌ Error details:', {
      //   pathname,
      //   userId,
      //   errorMessage: error instanceof Error ? error.message : 'Unknown error',
      //   errorStack: error instanceof Error ? error.stack : 'No stack trace',
      // })
      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess: false,
        shouldRedirect: true,
        redirectTo: '/unauthorized',
        reason: 'Role access check failed',
      }
    }
  }

  // Default: allow access

  return {
    isAuthenticated: true,
    userId,
    hasDirectorAccess: false, // We don't need to check this for non-director paths
    shouldRedirect: false,
    redirectTo: null,
  }
}
