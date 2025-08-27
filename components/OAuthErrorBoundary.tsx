'use client'

import type { OAuthError } from '@/types'
import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGoogleAuthSimple } from '@/hooks/useGoogleAuth'

/**
 * Composant d'affichage d'erreur OAuth avec différents niveaux de détail
 */
interface OAuthErrorDisplayProps {
  error: OAuthError
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'card' | 'full'
  showRetry?: boolean
  showDetails?: boolean
}

export const OAuthErrorDisplay: React.FC<OAuthErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'inline',
  showRetry = true,
  showDetails = false,
}) => {
  // Mapper les codes d'erreur aux messages utilisateur
  const getErrorMessage = (error: OAuthError): { title: string, description: string } => {
    const errorMap: Record<string, { title: string, description: string }> = {
      access_denied: {
        title: 'Accès refusé',
        description: 'Vous avez refusé l\'autorisation. Veuillez réessayer et accepter les permissions.',
      },
      invalid_request: {
        title: 'Requête invalide',
        description: 'Une erreur s\'est produite lors de la demande d\'authentification.',
      },
      unauthorized_client: {
        title: 'Client non autorisé',
        description: 'L\'application n\'est pas autorisée à effectuer cette demande.',
      },
      unsupported_response_type: {
        title: 'Type de réponse non supporté',
        description: 'Configuration d\'authentification incorrecte.',
      },
      invalid_scope: {
        title: 'Portée invalide',
        description: 'Les permissions demandées ne sont pas valides.',
      },
      server_error: {
        title: 'Erreur serveur',
        description: 'Une erreur temporaire s\'est produite. Veuillez réessayer.',
      },
      temporarily_unavailable: {
        title: 'Service temporairement indisponible',
        description: 'Le service d\'authentification est temporairement indisponible.',
      },
      popup_blocked: {
        title: 'Popup bloquée',
        description: 'Votre navigateur a bloqué la popup d\'authentification. Veuillez autoriser les popups et réessayer.',
      },
      popup_closed: {
        title: 'Popup fermée',
        description: 'La popup d\'authentification a été fermée avant la fin du processus.',
      },
      network_error: {
        title: 'Erreur réseau',
        description: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
      },
      OAUTH_ERROR: {
        title: 'Erreur d\'authentification',
        description: error.message,
      },
    }

    return errorMap[error.code] || {
      title: 'Erreur inattendue',
      description: error.message || 'Une erreur inattendue s\'est produite.',
    }
  }

  const { title, description } = getErrorMessage(error)

  if (variant === 'full') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-red-900 dark:text-red-100">{title}</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {showDetails && (
              <div className="rounded-md bg-red-50 dark:bg-red-950/30 p-3">
                <p className="text-xs text-red-800 dark:text-red-200">
                  <strong>Code:</strong>
                  {' '}
                  {error.code}
                </p>
                {error.details && (
                  <pre className="mt-2 text-xs text-red-700 dark:text-red-300 overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {showRetry && onRetry && (
                <Button onClick={onRetry} className="flex-1">
                  Réessayer
                </Button>
              )}
              {onDismiss && (
                <Button variant="outline" onClick={onDismiss} className="flex-1">
                  Fermer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {title}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {description}
              </p>

              {(showRetry || onDismiss) && (
                <div className="mt-3 flex gap-2">
                  {showRetry && onRetry && (
                    <Button size="sm" onClick={onRetry}>
                      Réessayer
                    </Button>
                  )}
                  {onDismiss && (
                    <Button size="sm" variant="outline" onClick={onDismiss}>
                      Fermer
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Variant inline (défaut)
  return (
    <Alert variant="destructive">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        {(showRetry || onDismiss) && (
          <div className="mt-3 flex gap-2">
            {showRetry && onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Réessayer
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Fermer
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

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

  const renderError = (
    variant: 'inline' | 'card' | 'full' = 'inline',
    options: {
      showRetry?: boolean
      showDetails?: boolean
      mode?: 'signin' | 'signup'
    } = {},
  ) => {
    const { showRetry = true, showDetails = false, mode = 'signin' } = options

    if (!error)
      return null

    return (
      <OAuthErrorDisplay
        error={error}
        variant={variant}
        showRetry={showRetry}
        showDetails={showDetails}
        onRetry={() => handleRetry(mode)}
        onDismiss={clearError}
      />
    )
  }

  return {
    hasError: !!error,
    error,
    clearError,
    handleRetry,
    renderError,
  }
}

/**
 * Boundary d'erreur pour capturer les erreurs OAuth non gérées
 */
interface OAuthErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class OAuthErrorBoundary extends React.Component<
  React.PropsWithChildren<Record<string, never>>,
  OAuthErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<Record<string, never>>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): OAuthErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('OAuth Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const oauthError: OAuthError = {
        code: 'BOUNDARY_ERROR',
        message: this.state.error.message || 'Une erreur inattendue s\'est produite',
        details: {
          name: this.state.error.name,
          stack: this.state.error.stack,
        },
      }

      return (
        <OAuthErrorDisplay
          error={oauthError}
          variant="full"
          showRetry={true}
          showDetails={process.env.NODE_ENV === 'development'}
          onRetry={() => {
            this.setState({ hasError: false, error: undefined })
            window.location.reload()
          }}
        />
      )
    }

    return this.props.children
  }
}
