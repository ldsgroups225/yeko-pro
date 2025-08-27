'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getUserRolesCached } from '@/services/authorizationService'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const processCallback = async () => {
      try {
        const supabase = createClient()

        // Get URL parameters
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Handle OAuth errors from provider
        if (errorParam) {
          const errorMsg = errorDescription || errorParam
          setError(errorMsg)
          toast.error(`Erreur d'authentification: ${errorMsg}`)

          // Redirect to sign-in after a delay
          timeoutId = setTimeout(() => {
            router.replace('/sign-in')
          }, 3000)
          return
        }

        // If we have a code, let Supabase handle the session automatically
        // by just checking the current session
        if (code) {
          // Wait a moment for Supabase to process the OAuth callback
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Get current session (Supabase should have processed OAuth by now)
        const { data, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('Session error:', sessionError)
          throw new Error(sessionError.message)
        }

        if (data.session?.user) {
          const user = data.session.user

          // Check if user exists in our database
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single()

          // If new user, create profile
          if (!existingUser && user.user_metadata) {
            try {
              const response = await fetch('/api/auth/create-user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user.id,
                  userMetadata: user.user_metadata,
                }),
              })

              if (!response.ok) {
                console.warn('Failed to create user profile via API, attempting direct creation')
                // Fallback: try to create user directly (though this might not work client-side)
              }
            }
            catch (createError) {
              console.warn('Error creating user profile:', createError)
              // Non-critical error, continue with authentication
            }
          }

          // Check if this is a new user based on creation time
          const createdAt = new Date(user.created_at)
          const now = new Date()
          const timeDiff = now.getTime() - createdAt.getTime()
          const isNewUser = timeDiff < 60000 // Less than 1 minute ago = new user

          if (isNewUser) {
            toast.success('Inscription réussie avec Google!')
          }
          else {
            toast.success('Connexion réussie!')
          }

          // Get user roles to determine redirect destination
          try {
            const roleInfo = await getUserRolesCached(user.id)

            // Redirect based on user role
            const redirectTo = roleInfo?.hasDirectorAccess ? '/t/home' : '/unauthorized'

            // Small delay to show toast
            timeoutId = setTimeout(() => {
              router.replace(redirectTo)
            }, 1000)
          }
          catch (roleError) {
            console.error('Error fetching user roles after OAuth:', roleError)
            // Fallback to unauthorized for safety
            timeoutId = setTimeout(() => {
              router.replace('/unauthorized')
            }, 1000)
          }
        }
        else {
          // No session found
          throw new Error('Aucune session utilisateur trouvée après authentification')
        }
      }
      catch (error) {
        console.error('OAuth callback processing error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Erreur de traitement de l\'authentification'
        setError(errorMsg)
        toast.error(errorMsg)

        // Redirect to sign-in after error
        timeoutId = setTimeout(() => {
          router.replace('/sign-in')
        }, 3000)
      }
      finally {
        setIsProcessing(false)
      }
    }

    processCallback()

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [router, searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto text-center space-y-6 p-6">
          <div className="rounded-full bg-red-100 p-3 w-16 h-16 mx-auto flex items-center justify-center dark:bg-red-900/20">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-red-900 dark:text-red-100">
              Erreur d'authentification
            </h1>
            <p className="text-red-700 dark:text-red-300">
              {error}
            </p>
            <p className="text-sm text-muted-foreground">
              Vous allez être redirigé vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-auto text-center space-y-6 p-6">
          <div className="rounded-full bg-primary/10 p-3 w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Authentification en cours...
            </h1>
            <p className="text-muted-foreground">
              Nous traitons votre connexion avec Google
            </p>
            <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
              <span>Veuillez patienter</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto text-center space-y-6 p-6">
        <div className="rounded-full bg-primary/10 p-3 w-16 h-16 mx-auto flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Chargement...
          </h1>
          <p className="text-muted-foreground">
            Préparation de la page d'authentification
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthCallbackContent />
    </Suspense>
  )
}
