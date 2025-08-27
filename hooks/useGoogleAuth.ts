'use client'

import type {
  OAuthError,
  OAuthOptions,
  OAuthState,
} from '@/types'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import {
  getGoogleProfile,
  hasGoogleAccountLinked,
  linkGoogleAccount,
  signInWithGoogle,
  signUpWithGoogle,
  unlinkGoogleAccount,
} from '@/services/oauthService'

/**
 * Custom hook for Google OAuth authentication
 * Provides methods for sign-in, sign-up, and account management
 */
export function useGoogleAuth() {
  const [state, setState] = useState<OAuthState>({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null,
  })

  /**
   * Updates the OAuth state
   */
  const updateState = useCallback((updates: Partial<OAuthState>) => {
    setState(prevState => ({ ...prevState, ...updates }))
  }, [])

  /**
   * Handles OAuth errors consistently
   */
  const handleError = useCallback((error: string | OAuthError) => {
    const oauthError: OAuthError = typeof error === 'string'
      ? { code: 'OAUTH_ERROR', message: error }
      : error

    updateState({ error: oauthError, isLoading: false })
    toast.error(oauthError.message)
  }, [updateState])

  /**
   * Initiates Google sign-in flow
   */
  const googleSignIn = useCallback(async (options?: Partial<OAuthOptions>) => {
    try {
      updateState({ isLoading: true, error: null })

      const result = await signInWithGoogle(options)

      if (!result.success) {
        handleError(result.error || 'Erreur lors de la connexion avec Google')
        return false
      }

      if (result.url) {
        // Redirect to Google OAuth
        window.location.href = result.url
        return true
      }

      handleError('URL d\'authentification non reçue')
      return false
    }
    catch (error) {
      handleError(error instanceof Error ? error.message : 'Erreur inattendue lors de la connexion')
      return false
    }
  }, [updateState, handleError])

  /**
   * Initiates Google sign-up flow
   */
  const googleSignUp = useCallback(async (options?: Partial<OAuthOptions>) => {
    try {
      updateState({ isLoading: true, error: null })

      const result = await signUpWithGoogle(options)

      if (!result.success) {
        handleError(result.error || 'Erreur lors de l\'inscription avec Google')
        return false
      }

      if (result.url) {
        // Redirect to Google OAuth
        window.location.href = result.url
        return true
      }

      handleError('URL d\'inscription non reçue')
      return false
    }
    catch (error) {
      handleError(error instanceof Error ? error.message : 'Erreur inattendue lors de l\'inscription')
      return false
    }
  }, [updateState, handleError])

  /**
   * Links Google account to current user
   */
  const linkGoogle = useCallback(async (userId: string) => {
    try {
      updateState({ isLoading: true, error: null })

      const result = await linkGoogleAccount(userId)

      if (!result.success) {
        handleError(result.error || 'Erreur lors de la liaison du compte Google')
        return false
      }

      if (result.url) {
        window.location.href = result.url
        return true
      }

      handleError('URL de liaison non reçue')
      return false
    }
    catch (error) {
      handleError(error instanceof Error ? error.message : 'Erreur inattendue lors de la liaison')
      return false
    }
  }, [updateState, handleError])

  /**
   * Unlinks Google account from current user
   */
  const unlinkGoogle = useCallback(async (userId: string) => {
    try {
      updateState({ isLoading: true, error: null })

      const result = await unlinkGoogleAccount(userId)

      if (!result.success) {
        handleError(result.error || 'Erreur lors de la suppression de la liaison Google')
        return false
      }

      toast.success('Compte Google supprimé avec succès')
      updateState({ isLoading: false })
      return true
    }
    catch (error) {
      handleError(error instanceof Error ? error.message : 'Erreur inattendue lors de la suppression')
      return false
    }
  }, [updateState, handleError, toast])

  /**
   * Checks if current user has Google account linked
   */
  const checkGoogleLinked = useCallback(async (userId?: string): Promise<boolean> => {
    try {
      return await hasGoogleAccountLinked(userId)
    }
    catch (error) {
      console.error('Error checking Google account status:', error)
      return false
    }
  }, [])

  /**
   * Gets Google profile for current user
   */
  const fetchGoogleProfile = useCallback(async () => {
    try {
      return await getGoogleProfile()
    }
    catch (error) {
      console.error('Error fetching Google profile:', error)
      return null
    }
  }, [])

  /**
   * Handles authentication state changes from Supabase
   */
  const handleAuthChange = useCallback(async (event: string, session: any) => {
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          updateState({
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })

          // Check if this was an OAuth sign-in
          const hasGoogleLinked = await checkGoogleLinked(session.user.id)
          if (hasGoogleLinked) {
            toast.success('Connexion Google réussie!')
          }
        }
        break

      case 'SIGNED_OUT':
        updateState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        })
        break

      case 'TOKEN_REFRESHED':
        // Handle token refresh if needed
        break

      default:
        break
    }
  }, [updateState, checkGoogleLinked, toast])

  /**
   * Initializes auth listener
   */
  const initializeAuthListener = useCallback(() => {
    const supabase = createClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange)

    return () => subscription.unsubscribe()
  }, [handleAuthChange])

  /**
   * Clears OAuth errors
   */
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  /**
   * Resets OAuth state
   */
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isAuthenticated: false,
      user: null,
    })
  }, [])

  return {
    // State
    ...state,

    // Actions
    googleSignIn,
    googleSignUp,
    linkGoogle,
    unlinkGoogle,
    checkGoogleLinked,
    fetchGoogleProfile,

    // Utilities
    clearError,
    resetState,
    initializeAuthListener,
    handleAuthChange,
  } as const
}

/**
 * Hook for simplified Google authentication
 * Provides just the essential methods for basic OAuth flow
 */
export function useGoogleAuthSimple() {
  const { googleSignIn, googleSignUp, isLoading, error, clearError } = useGoogleAuth()

  return {
    googleSignIn,
    googleSignUp,
    isLoading,
    error,
    clearError,
  } as const
}
