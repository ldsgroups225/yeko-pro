'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export interface MedicalCondition {
  id: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

interface MedicalInfoProps {
  conditions?: MedicalCondition[]
  isLoading?: boolean
}

export function MedicalInfo({ conditions, isLoading }: MedicalInfoProps) {
  // Default condition if none provided
  const defaultConditions: MedicalCondition[] = [
    {
      id: 'asthma',
      description: 'L\'élève est asthmatique - Nécessite un inhalateur',
      severity: 'medium',
    },
  ]

  const displayedConditions = conditions || defaultConditions

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Informations Médicales</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse bg-muted rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Médicales</CardTitle>
        <CardDescription>Conditions médicales et allergies</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedConditions.map(condition => (
          <Alert
            key={condition.id}
            variant={condition.severity === 'high' ? 'destructive' : 'default'}
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{condition.description}</AlertDescription>
          </Alert>
        ))}
        {displayedConditions.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune condition médicale particulière signalée
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
