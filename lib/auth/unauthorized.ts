import { redirect } from 'next/navigation'

/**
 * Utility function to handle unauthorized access in server components
 * This follows Next.js 15 patterns for authorization handling
 *
 * @param message - Optional message to pass to the unauthorized page
 * @param redirectTo - Optional custom redirect path (defaults to /unauthorized)
 */
export function handleUnauthorized(
  message?: string,
  redirectTo: string = '/unauthorized',
): never {
  // In production, you might want to log this event
  if (process.env.NODE_ENV === 'development') {
    console.error('[Authorization] Unauthorized access attempt:', {
      message,
      timestamp: new Date().toISOString(),
    })
  }

  // Redirect to the unauthorized page with optional message
  if (message) {
    const params = new URLSearchParams({ message })
    redirect(`${redirectTo}?${params.toString()}`)
  }

  redirect(redirectTo)
}

/**
 * Check if a user has the required role(s)
 * Throws unauthorized error if check fails
 *
 * @param userRoles - Array of user's roles
 * @param requiredRoles - Array of required roles (user must have at least one)
 * @param message - Optional message for unauthorized error
 */
export function requireRoles(
  userRoles: string[],
  requiredRoles: string[],
  message?: string,
): void {
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

  if (!hasRequiredRole) {
    handleUnauthorized(
      message || `Access requires one of these roles: ${requiredRoles.join(', ')}`,
    )
  }
}

/**
 * Async version for checking authorization with database
 * Can be used in server components that need to verify permissions
 */
export async function checkAuthorization(
  userId: string | null,
  requiredPermission?: string,
): Promise<boolean> {
  if (!userId) {
    return false
  }

  // Here you would typically check against your database
  // For now, we'll import and use our existing authorization service
  try {
    const { getCachedUserRoles } = await import('@/lib/cache/roleCache')
    const userRoles = await getCachedUserRoles(userId)

    if (!userRoles) {
      return false
    }

    // Check if user has director access (or implement your own logic)
    if (requiredPermission === 'director') {
      return userRoles?.hasDirectorAccess ?? false
    }

    // Default to checking if user has any role
    return (userRoles?.roles?.length ?? 0) > 0
  }
  catch (error) {
    console.error('Authorization check failed:', error)
    return false
  }
}

/**
 * Server action wrapper that includes authorization
 * Use this to wrap server actions that require specific permissions
 */
export function withAuthorization<T extends (...args: any[]) => Promise<any>>(
  action: T,
  requiredPermission?: string,
): T {
  return (async (...args: Parameters<T>) => {
    // Get the current user (you'll need to implement this based on your auth setup)
    const { getUserId } = await import('@/services/userService')
    const userId = await getUserId()

    if (!userId) {
      handleUnauthorized('Authentication required')
    }

    const isAuthorized = await checkAuthorization(userId, requiredPermission)

    if (!isAuthorized) {
      handleUnauthorized('Insufficient permissions')
    }

    // If authorized, execute the original action
    return action(...args)
  }) as T
}
