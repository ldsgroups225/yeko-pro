// app/payments/components/steps/Step3GradeSelection.tsx

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { useEffect, useState } from 'react'
import { fetchGrades } from '../../actions'

interface Step3GradeSelectionProps {
  onComplete: () => void
  onBack: () => void
  onGradeSelect: (gradeId: number) => void
  onStateAssignedChange: (isStateAssigned: boolean) => void
  selectedGradeId: number | null
  isStateAssigned: boolean
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
  selectedGradeId,
  isStateAssigned,
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

  if (isLoading) {
    return <div>Chargement des niveaux...</div>
  }

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  const handleGradeSelect = (gradeId: string) => {
    onGradeSelect(Number(gradeId))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <Label>Sélectionnez le niveau</Label>
              <RadioGroup
                value={selectedGradeId?.toString()}
                onValueChange={handleGradeSelect}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
              >
                {grades.map(grade => (
                  <div key={grade.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={grade.id.toString()} id={`grade-${grade.id}`} />
                    <Label htmlFor={`grade-${grade.id}`} className="flex-1">
                      <div>
                        <span className="font-medium">{grade.name}</span>
                        {grade.description && (
                          <p className="text-sm text-muted-foreground">{grade.description}</p>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="state-assigned">Affectation de l'État</Label>
              <Switch
                id="state-assigned"
                checked={isStateAssigned}
                onCheckedChange={onStateAssignedChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button
          onClick={onComplete}
          disabled={!selectedGradeId}
        >
          Continuer
        </Button>
      </div>
    </div>
  )
}
