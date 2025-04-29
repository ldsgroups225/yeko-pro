'use client'

import type { MedicalCondition } from '@/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

interface MedicalInfoProps {
  conditions: MedicalCondition[]
  isLoading?: boolean
}

export function MedicalInfo({ conditions, isLoading }: MedicalInfoProps) {
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
        {conditions.map(condition => (
          <Alert
            key={condition.id}
            variant={condition.severity === 'high' ? 'destructive' : 'default'}
          >
            <AlertCircle className="h-4 w-4 -mt-1" />
            <AlertDescription>{condition.description}</AlertDescription>
          </Alert>
        ))}
        {conditions.length === 0 && (
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
