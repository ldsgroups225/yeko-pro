'use client'

import type { OAuthError } from '@/types'
import { OAuthErrorDisplay } from '@/components/OAuthErrorBoundary'
import { useGoogleAuthSimple } from '@/hooks/useGoogleAuth'

/**
 * Hook pour gérer l'état des erreurs OAuth dans l'UI
 */
export function useOAuthErrorDisplay() {
  const { error, clearError } = useGoogleAuthSimple()

  const errorComponent = error
    ? (
        <OAuthErrorDisplay
          error={{
            message: error.message || 'An unknown error occurred',
            code: 'unknown_error',
            ...(typeof error === 'object' ? error : {}),
          } as OAuthError}
          variant="inline"
          onDismiss={clearError}
          showRetry={false}
          showDetails={false}
        />
      )
    : null

  return {
    hasError: !!error,
    errorMessage: error?.message || '',
    clearError,
    errorComponent,
  }
}
