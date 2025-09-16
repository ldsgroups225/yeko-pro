'use client'

import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { fetchGrades } from '../../actions'

interface Step3GradeSelectionProps {
  onComplete: () => void
  onBack: () => void
  onGradeSelect: (gradeId: number) => void
  onStateAssignedChange: (isStateAssigned: boolean) => void
  onOrphanChange: (isOrphan: boolean) => void
  onCanteenSubscriptionChange: (hasCanteenSubscription: boolean) => void
  onTransportSubscriptionChange: (hasTransportSubscription: boolean) => void
  selectedGradeId: number | null
  isStateAssigned: boolean
  isOrphan: boolean
  hasCanteenSubscription: boolean
  hasTransportSubscription: boolean
  schoolId: string
}

interface Grade {
  id: number
  name: string
  cycleId: string
  description: string
}

export function Step3GradeSelection({
  onComplete,
  onBack,
  onGradeSelect,
  onStateAssignedChange,
  onOrphanChange,
  onCanteenSubscriptionChange,
  onTransportSubscriptionChange,
  selectedGradeId,
  isStateAssigned,
  isOrphan,
  hasCanteenSubscription,
  hasTransportSubscription,
  schoolId,
}: Step3GradeSelectionProps) {
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadGrades() {
      try {
        const data = await fetchGrades(schoolId)
        if (mounted) {
          setGrades(data)
          setIsLoading(false)
        }
      }
      catch (err) {
        console.error('Error loading grades:', err)
        if (mounted) {
          setError('Impossible de charger les niveaux')
          setIsLoading(false)
        }
      }
    }

    loadGrades()
    return () => {
      mounted = false
    }
  }, [schoolId])

  const handleGradeSelect = (gradeId: string) => {
    onGradeSelect(Number(gradeId))
  }

  // Loading state UI
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sélection du niveau</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state UI
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Part 1: Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Sélection du niveau</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedGradeId?.toString() || ''}
            onValueChange={handleGradeSelect}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {grades.map(grade => (
              <div
                key={grade.id}
                className={`border rounded-md p-4 hover:bg-accent/20 transition-colors cursor-pointer ${
                  selectedGradeId === grade.id ? 'border-primary bg-accent/30' : 'border-input'
                }`}
                onClick={() => handleGradeSelect(grade.id.toString())}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value={grade.id.toString()} id={`grade-${grade.id}`} />
                  <Label htmlFor={`grade-${grade.id}`} className="flex-1 cursor-pointer">
                    <div>
                      <span className="font-medium">{grade.name}</span>
                      {grade.description && (
                        <p className="text-sm text-muted-foreground mt-1">{grade.description}</p>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Part 2: Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle>Options supplémentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status options */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="state-assigned" className="flex-1">
                  <div>
                    <span>Affectation de l'État</span>
                    <p className="text-sm text-muted-foreground">L'élève est affecté par l'État à cet établissement</p>
                  </div>
                </Label>
                <Switch
                  id="state-assigned"
                  checked={isStateAssigned}
                  onCheckedChange={onStateAssignedChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="orphan" className="flex-1">
                  <div>
                    <span>Orphelin de père</span>
                    <p className="text-sm text-muted-foreground">L'élève bénéficie du statut d'orphelin</p>
                  </div>
                </Label>
                <Switch
                  id="orphan"
                  checked={isOrphan}
                  onCheckedChange={onOrphanChange}
                />
              </div>
            </div>

            {/* Subscription options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Abonnements</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="canteen-subscription" className="flex-1">
                  <div>
                    <span>Abonnement à la cantine</span>
                    <p className="text-sm text-muted-foreground">Accès aux services de restauration</p>
                  </div>
                </Label>
                <Switch
                  id="canteen-subscription"
                  checked={hasCanteenSubscription}
                  onCheckedChange={onCanteenSubscriptionChange}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="transport-subscription" className="flex-1">
                  <div>
                    <span>Abonnement au bus scolaire</span>
                    <p className="text-sm text-muted-foreground">Transport scolaire aller-retour</p>
                  </div>
                </Label>
                <Switch
                  id="transport-subscription"
                  checked={hasTransportSubscription}
                  onCheckedChange={onTransportSubscriptionChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button
          onClick={onComplete}
          disabled={!selectedGradeId}
          className="px-6"
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
