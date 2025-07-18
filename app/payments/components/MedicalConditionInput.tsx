// app/payments/components/MedicalConditionInput.tsx

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MedicalConditionSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const

interface MedicalConditionSeverityOption {
  label: string
  value: (typeof MedicalConditionSeverity)[keyof typeof MedicalConditionSeverity]
}

const severityOptions: MedicalConditionSeverityOption[] = [
  { label: 'Faible', value: MedicalConditionSeverity.LOW },
  { label: 'Moyen', value: MedicalConditionSeverity.MEDIUM },
  { label: 'Fort', value: MedicalConditionSeverity.HIGH },
]

// Define MedicalCondition interface
interface MedicalCondition {
  description: string
  severity: 'low' | 'medium' | 'high'
  id?: string
}

// MedicalConditionInput is array of two columns: name "Input" and severity "Select"
interface MedicalConditionInputProps {
  value: MedicalCondition[]
  onChange: (value: MedicalCondition[]) => void
  disabled?: boolean
}

export function MedicalConditionInput({ value, onChange, disabled = false }: MedicalConditionInputProps) {
  const [newCondition, setNewCondition] = useState<MedicalCondition>({
    description: '',
    severity: 'medium',
  })

  const addCondition = () => {
    if (!newCondition.description.trim())
      return

    const updatedConditions = [
      ...value,
      { ...newCondition, id: crypto.randomUUID() },
    ]
    onChange(updatedConditions)
    setNewCondition({ description: '', severity: 'medium' })
  }

  const removeCondition = (index: number) => {
    const updatedConditions = [...value]
    updatedConditions.splice(index, 1)
    onChange(updatedConditions)
  }

  return (
    <div className="space-y-4">
      {/* List existing conditions */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((condition, index) => (
            <div key={condition.id || index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
              <div className="flex-1">
                <p className="text-sm font-medium">{condition.description}</p>
                <p className="text-xs text-muted-foreground">
                  Sévérité:
                  {' '}
                  {
                    {
                      low: 'Faible',
                      medium: 'Moyen',
                      high: 'Fort',
                    }[condition.severity]
                  }
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(index)}
                disabled={disabled}
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new condition */}
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-8">
            <Input
              placeholder="Description de la condition médicale"
              value={newCondition.description}
              onChange={e => setNewCondition({ ...newCondition, description: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div className="col-span-4">
            <Select
              value={newCondition.severity}
              onValueChange={value => setNewCondition({ ...newCondition, severity: value as 'low' | 'medium' | 'high' })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sévérité" />
              </SelectTrigger>
              <SelectContent>
                {severityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCondition}
          disabled={disabled || !newCondition.description.trim()}
          className="w-full"
        >
          Ajouter une condition médicale
        </Button>
      </div>
    </div>
  )
}
