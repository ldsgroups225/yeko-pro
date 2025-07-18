'use client'

import { Activity, AlertCircle, AlertTriangle, Heart } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface MedicalCondition {
  id: string
  type: 'condition' | 'allergy' | 'medication'
  name: string
  severity: 'low' | 'medium' | 'high'
  description?: string
  instructions?: string
  dateIdentified: string
  status: 'active' | 'managed' | 'resolved'
}

interface MedicalConditionsOverviewProps {
  conditions: MedicalCondition[]
  isLoading?: boolean
}

const severityIcons = {
  low: <Heart className="h-4 w-4 text-blue-500" />,
  medium: <Activity className="h-4 w-4 text-yellow-500" />,
  high: <AlertTriangle className="h-4 w-4 text-red-500" />,
}

function ConditionAlert({ condition }: { condition: MedicalCondition }) {
  const statusColors = {
    active: 'bg-red-500/10 text-red-500',
    managed: 'bg-yellow-500/10 text-yellow-500',
    resolved: 'bg-green-500/10 text-green-500',
  }

  return (
    <Alert className={statusColors[condition.status]}>
      <div className="flex items-start gap-2">
        {severityIcons[condition.severity]}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium">
              {condition.name}
              <Badge
                variant="outline"
                className="ml-2 text-xs"
              >
                {condition.type}
              </Badge>
            </div>
            <Badge>
              {condition.status}
            </Badge>
          </div>
          {(condition.description || condition.instructions) && (
            <AlertDescription className="mt-2">
              {condition.description && (
                <p>{condition.description}</p>
              )}
              {condition.instructions && (
                <p className="mt-1 font-medium">
                  Instructions:
                  {' '}
                  {condition.instructions}
                </p>
              )}
            </AlertDescription>
          )}
          <div className="mt-1 text-xs opacity-70">
            Identifié le:
            {' '}
            {condition.dateIdentified}
          </div>
        </div>
      </div>
    </Alert>
  )
}

function ConditionAlertSkeleton() {
  return (
    <Alert>
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-4" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
          <Skeleton className="h-3 w-24 mt-1" />
        </div>
      </div>
    </Alert>
  )
}

export function MedicalConditionsOverview({ conditions, isLoading }: MedicalConditionsOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conditions Médicales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConditionAlertSkeleton />
          <ConditionAlertSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (conditions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conditions Médicales</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucune condition médicale signalée
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const activeConditions = conditions.filter(c => c.status === 'active')
  const managedConditions = conditions.filter(c => c.status === 'managed')
  const resolvedConditions = conditions.filter(c => c.status === 'resolved')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions Médicales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeConditions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-red-500">
              Conditions Actives
            </h3>
            {activeConditions.map(condition => (
              <ConditionAlert key={condition.id} condition={condition} />
            ))}
          </div>
        )}

        {managedConditions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-yellow-500">
              Conditions Gérées
            </h3>
            {managedConditions.map(condition => (
              <ConditionAlert key={condition.id} condition={condition} />
            ))}
          </div>
        )}

        {resolvedConditions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-green-500">
              Conditions Résolues
            </h3>
            {resolvedConditions.map(condition => (
              <ConditionAlert key={condition.id} condition={condition} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
