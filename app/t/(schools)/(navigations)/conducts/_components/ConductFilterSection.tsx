'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useClasses } from '@/hooks'

interface ConductFilterSectionProps {
  onClassChange: (classId: string) => void
  onGradeFilterChange: (grade: string) => void
  onScoreRangeChange: (min: number, max: number) => void
  selectedClass?: string
  selectedGrade?: string
  scoreRange?: { min: number, max: number }
}

export function ConductFilterSection({
  onClassChange,
  onGradeFilterChange,
  onScoreRangeChange,
  selectedClass,
  selectedGrade,
  scoreRange,
}: ConductFilterSectionProps) {
  const { classes, isLoading } = useClasses()

  const [localScoreRange, setLocalScoreRange] = useState<[number, number]>([
    scoreRange?.min ?? 0,
    scoreRange?.max ?? 20,
  ])

  // Fallback classes data to prevent errors
  const safeClasses = classes || []

  const handleScoreRangeChange = (values: number[]) => {
    setLocalScoreRange([values[0], values[1]])
  }

  const applyScoreRange = () => {
    onScoreRangeChange(localScoreRange[0], localScoreRange[1])
  }

  const resetFilters = () => {
    onClassChange('all')
    onGradeFilterChange('all')
    setLocalScoreRange([0, 20])
    onScoreRangeChange(0, 20)
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium mb-3">Filtres de Conduite</h4>
      </div>

      {/* Class Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Classe</Label>
        <Select value={selectedClass || 'all'} onValueChange={onClassChange} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? 'Chargement...' : 'Toutes les classes'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {!isLoading && safeClasses.map(classItem => (
              <SelectItem key={classItem.id} value={classItem.id}>
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grade Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Appréciation</Label>
        <Select value={selectedGrade || 'all'} onValueChange={onGradeFilterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Toutes les appréciations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les appréciations</SelectItem>
            <SelectItem value="TRES_BONNE">Très bonne conduite</SelectItem>
            <SelectItem value="BONNE">Bonne conduite</SelectItem>
            <SelectItem value="PASSABLE">Conduite passable</SelectItem>
            <SelectItem value="MAUVAISE">Mauvaise conduite</SelectItem>
            <SelectItem value="BLAME">Blâme</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Score Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Plage de notes:
          {' '}
          {localScoreRange[0]}
          {' '}
          -
          {' '}
          {localScoreRange[1]}
          /20
        </Label>
        <div className="px-2">
          <Slider
            value={localScoreRange}
            onValueChange={handleScoreRangeChange}
            max={20}
            min={0}
            step={0.5}
            className="w-full"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>10</span>
          <span>20</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={applyScoreRange}
          className="w-full"
        >
          Appliquer la plage
        </Button>
      </div>

      {/* Reset Filters */}
      <div className="pt-4 border-t">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  )
}
