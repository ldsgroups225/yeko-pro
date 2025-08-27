'use client'

import { AlertTriangleIcon, GraduationCapIcon, UserIcon, UsersIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/hooks'
import { AuthorizationServiceClient } from '@/services/authorizationServiceClient'
import { ERole } from '@/types'

interface AuthorizationInfo {
  userRole: ERole | null
  message: string
  isLoading: boolean
}

/**
 * Dynamic component that displays role-specific unauthorized access information
 */
export function UnauthorizedContent() {
  const { user } = useUser()
  const [authInfo, setAuthInfo] = useState<AuthorizationInfo>({
    userRole: null,
    message: '',
    isLoading: true,
  })

  useEffect(() => {
    const fetchAuthorizationInfo = async () => {
      if (!user?.id) {
        setAuthInfo({
          userRole: null,
          message: 'Si c\'est pour rejoindre une école, veuillez le signaler et patienter.',
          isLoading: false,
        })
        return
      }

      try {
        const result = await AuthorizationServiceClient.getPostAuthRedirect(user.id)
        setAuthInfo({
          userRole: result.userRole,
          message: result.message || 'Accès non autorisé.',
          isLoading: false,
        })
      }
      catch {
        setAuthInfo({
          userRole: null,
          message: 'Erreur lors de la vérification des permissions. Veuillez réessayer.',
          isLoading: false,
        })
      }
    }

    fetchAuthorizationInfo()
  }, [user?.id])

  const getRoleInfo = (role: ERole | null) => {
    switch (role) {
      case ERole.TEACHER:
        return {
          icon: <GraduationCapIcon className="size-5" />,
          label: 'Enseignant',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
        }
      case ERole.PARENT:
        return {
          icon: <UsersIcon className="size-5" />,
          label: 'Parent',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
        }
      case ERole.DIRECTOR:
        return {
          icon: <UserIcon className="size-5" />,
          label: 'Directeur',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
        }
      default:
        return {
          icon: <AlertTriangleIcon className="size-5" />,
          label: 'Rôle non défini',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
        }
    }
  }

  if (authInfo.isLoading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded-md dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto dark:bg-gray-700"></div>
        </div>
      </div>
    )
  }

  const roleInfo = getRoleInfo(authInfo.userRole)

  return (
    <div className="space-y-4">
      {/* User Role Badge */}
      {authInfo.userRole && (
        <div className="flex justify-center">
          <Badge variant="secondary" className={`flex items-center gap-2 px-3 py-1 ${roleInfo.color}`}>
            {roleInfo.icon}
            <span className="font-medium">
              Votre rôle:
              {roleInfo.label}
            </span>
          </Badge>
        </div>
      )}

      {/* Role-specific Message */}
      <Alert>
        <AlertTriangleIcon className="size-4" />
        <AlertDescription className="text-sm leading-relaxed">
          {authInfo.message}
        </AlertDescription>
      </Alert>

      {/* Additional Information */}
      <div className="bg-secondary rounded-lg p-4 space-y-3">
        <h3 className="font-medium text-sm text-secondary-foreground">
          À propos de Yeko Pro
        </h3>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>
            •
            {' '}
            <strong>Directeurs</strong>
            {' '}
            : Accès complet au système de gestion scolaire
          </p>
          <p>
            •
            {' '}
            <strong>Enseignants</strong>
            {' '}
            : Utilise l'application ## Yeko Prof ##
          </p>
          <p>
            •
            {' '}
            <strong>Parents</strong>
            {' '}
            : Utilise l'application ## Yeko Parent ##
          </p>
        </div>
      </div>

      {/* Development Status */}
      {(authInfo.userRole === ERole.TEACHER || authInfo.userRole === ERole.PARENT) && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground italic">
            🚧 Votre interface sera bientôt disponible. Restez connectés !
          </p>
        </div>
      )}
    </div>
  )
}
