'use client'

import type { OAuthError } from '@/types'
import { useGoogleAuthSimple } from '@/hooks/useGoogleAuth'

/**
 * Hook pour utiliser l'affichage d'erreur OAuth avec retry automatique
 */
export function useOAuthErrorHandler() {
  const { error, clearError, googleSignIn, googleSignUp } = useGoogleAuthSimple()

  const handleRetry = async (mode: 'signin' | 'signup' = 'signin') => {
    clearError()
    const authFunction = mode === 'signin' ? googleSignIn : googleSignUp
    return await authFunction()
  }

  const getErrorProps = (
    variant: 'inline' | 'card' | 'full' = 'inline',
    options: {
      showRetry?: boolean
      showDetails?: boolean
      mode?: 'signin' | 'signup'
    } = {},
  ) => {
    if (!error)
      return null

    // Safely cast the error to OAuthError
    const oauthError: OAuthError = {
      message: error.message || 'An unknown error occurred',
      code: 'unknown_error',
      ...(typeof error === 'object' ? error : {}),
    }

    return {
      error: oauthError,
      variant,
      onRetry: options.mode ? () => handleRetry(options.mode!) : undefined,
      onDismiss: clearError,
      showRetry: options.showRetry,
      showDetails: options.showDetails,
    }
  }

  return {
    error,
    hasError: !!error,
    clearError,
    handleRetry,
    getErrorProps,
  }
}
