'use client'

import { GenericSelect } from '@/components/GenericSelect'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ClassOption {
  id: string
  name: string
  tuitionFee: number
}

interface ClassSelectionStepProps {
  classes: ClassOption[]
  onSelect: (classId: string) => void
  isLoading?: boolean
}

export function ClassSelectionStep({
  classes,
  onSelect,
  isLoading = false,
}: ClassSelectionStepProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  const selectedClass = classes.find(c => c.id === selectedClassId)

  if (isLoading) {
    return (
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader>
        <h3 className="text-lg font-semibold text-center">Sélection de la classe</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <GenericSelect
            label="Classe"
            value={selectedClassId}
            options={classes}
            onValueChange={setSelectedClassId}
            placeholder="Sélectionnez une classe"
            required
          />

          {selectedClass && (
            <div className={cn(
              'mt-4 p-4 rounded-lg',
              'bg-background/50',
            )}
            >
              <h4 className="text-sm font-medium mb-2">Frais de scolarité</h4>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                  }).format(selectedClass.tuitionFee)}
                </span>
                <Button
                  onClick={() => onSelect(selectedClassId)}
                  disabled={!selectedClassId}
                >
                  Continuer
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
