// app/educator/_components/EducatorInscriptionFilterSection.tsx

'use client'

import type { IClass, IGrade } from '../types/inscription'
import { useMemo } from 'react'
import { Combobox } from '@/components/Combobox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface EducatorInscriptionFilterSectionProps {
  grades: IGrade[]
  classes: IClass[]
  onGradeChange: (gradeId: string) => void
  onClassChange: (classId: string) => void
  onEnrollmentStatusChange: (status: string) => void
  onGovernmentAffectedChange: (value: boolean | undefined) => void
  onOrphanChange: (value: boolean | undefined) => void
  selectedGrade?: string
  selectedClass?: string
  selectedEnrollmentStatus?: string
  isGovernmentAffected?: boolean
  isOrphan?: boolean
}

export function EducatorInscriptionFilterSection({
  grades,
  classes,
  onGradeChange,
  onClassChange,
  onEnrollmentStatusChange,
  onGovernmentAffectedChange,
  onOrphanChange,
  selectedGrade,
  selectedClass,
  selectedEnrollmentStatus,
  isGovernmentAffected,
  isOrphan,
}: EducatorInscriptionFilterSectionProps) {
  // Enhanced grade options with "all" option for Combobox
  const enhancedGradeOptions = useMemo(() => {
    const allOption = { id: 'all', name: 'Tous les niveaux' }
    return [allOption, ...grades.map(grade => ({ id: grade.id.toString(), name: grade.name }))]
  }, [grades])

  // Enhanced class options with "all" option for Combobox
  const enhancedClassOptions = useMemo(() => {
    const allOption = { id: 'all', name: 'Toutes les classes' }
    // Filter classes by selected grade
    const filteredClasses = selectedGrade && selectedGrade !== 'all'
      ? classes.filter(c => c.gradeId.toString() === selectedGrade)
      : classes

    return [allOption, ...filteredClasses.map(cls => ({
      id: cls.id,
      name: `${cls.name} (${cls.gradeName})`,
    }))]
  }, [classes, selectedGrade])

  // Handle grade selection from Combobox
  const handleGradeSelect = (option: { id: string, name: string }) => {
    onGradeChange(option.id)
    // Reset class selection when grade changes
    if (option.id !== selectedGrade) {
      onClassChange('all')
    }
  }

  // Handle class selection from Combobox
  const handleClassSelect = (option: { id: string, name: string }) => {
    onClassChange(option.id)
  }

  const resetFilters = () => {
    onGradeChange('all')
    onClassChange('all')
    onEnrollmentStatusChange('all')
    onGovernmentAffectedChange(undefined)
    onOrphanChange(undefined)
  }

  return (
    <div className="space-y-6 p-1">
      <div className="pb-2">
        <h4 className="font-semibold text-slate-900">Filtres d'Inscription</h4>
        <p className="text-sm text-slate-500 mt-1">Affiner les résultats selon vos critères</p>
      </div>

      {/* Grade Filter */}
      <div className="space-y-3">
        <Combobox
          value={selectedGrade || 'all'}
          options={enhancedGradeOptions}
          onSelect={handleGradeSelect}
          label="Niveau"
          placeholder="Tous les niveaux"
          searchPlaceholder="Rechercher un niveau..."
          emptyText="Aucun niveau trouvé"
          searchFrom="name"
          className="bg-white/80 border-slate-200 hover:bg-white focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Class Filter */}
      <div className="space-y-3">
        <Combobox
          value={selectedClass || 'all'}
          options={enhancedClassOptions}
          onSelect={handleClassSelect}
          label="Classe"
          placeholder="Toutes les classes"
          searchPlaceholder="Rechercher une classe..."
          emptyText="Aucune classe trouvée"
          searchFrom="name"
          className="bg-white/80 border-slate-200 hover:bg-white focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Enrollment Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Statut d'inscription</Label>
        <Select value={selectedEnrollmentStatus || 'all'} onValueChange={onEnrollmentStatusChange}>
          <SelectTrigger className="bg-white/80 border-slate-200 hover:bg-white focus:ring-2 focus:ring-blue-500/20">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200">
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span>En attente</span>
              </div>
            </SelectItem>
            <SelectItem value="accepted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Accepté</span>
              </div>
            </SelectItem>
            <SelectItem value="refused">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Refusé</span>
              </div>
            </SelectItem>
            {/* <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Actif</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                <span>Inactif</span>
              </div>
            </SelectItem>
            <SelectItem value="suspended">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Suspendu</span>
              </div>
            </SelectItem> */}
          </SelectContent>
        </Select>
      </div>

      {/* Special Status Filters */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Statuts spéciaux</Label>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="government-affected" className="text-sm text-muted-foreground">
              Les orientés d'état
            </label>
            <Switch
              id="government-affected"
              checked={isGovernmentAffected === true}
              onCheckedChange={checked => onGovernmentAffectedChange(checked ? true : undefined)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="orphan" className="text-sm text-muted-foreground">
              Élèves orphelins
            </label>
            <Switch
              id="orphan"
              checked={isOrphan === true}
              onCheckedChange={checked => onOrphanChange(checked ? true : undefined)}
            />
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  )
}
