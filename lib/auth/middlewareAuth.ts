import type { NextRequest } from 'next/server'
import { getCachedDirectorAccessMiddleware } from '@/lib/cache/middlewareRoleCache'
import { getEnvOrThrowServerSide } from '@/lib/utils/EnvServer'

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
  // Paths that require authentication (all /t/* routes)
  const authRequiredPaths = ['/t/']

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

  return publicAuthPages.some(path =>
    pathname === path || (path.endsWith('/') && pathname.startsWith(path)),
  )
}

/**
 * Main middleware authentication logic with role-based access control
 */
export async function checkMiddlewareAuth(
  request: NextRequest,
  user: any,
): Promise<MiddlewareAuthResult> {
  const pathname = request.nextUrl.pathname

  // If no user, check if auth is required
  if (!user) {
    // Unauthorized page requires authentication (only authenticated non-directors can see it)
    if (pathname === '/unauthorized' || isAuthRequiredPath(pathname)) {
      return {
        isAuthenticated: false,
        userId: null,
        hasDirectorAccess: false,
        shouldRedirect: true,
        redirectTo: '/sign-in',
        reason: 'Authentication required',
      }
    }

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
  // Special case: /unauthorized page is ONLY for authenticated non-directors
  if (pathname === '/unauthorized') {
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
  if (shouldRedirectAuthenticatedUser(pathname) && !pathname.startsWith('/t/')) {
    // Get user role to determine where to redirect
    try {
      const env = getEnvOrThrowServerSide()
      const cookies = request.cookies.getAll()
      const hasDirectorAccess = await getCachedDirectorAccessMiddleware(
        userId,
        cookies,
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      return {
        isAuthenticated: true,
        userId,
        hasDirectorAccess,
        shouldRedirect: true,
        redirectTo: hasDirectorAccess ? '/t/home' : '/unauthorized',
        reason: hasDirectorAccess ? 'Redirect to dashboard' : 'Non-director user',
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
  if (isDirectorOnlyPath(pathname)) {
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

  // Default: allow access
  return {
    isAuthenticated: true,
    userId,
    hasDirectorAccess: false, // We don't need to check this for non-director paths
    shouldRedirect: false,
    redirectTo: null,
  }
}
