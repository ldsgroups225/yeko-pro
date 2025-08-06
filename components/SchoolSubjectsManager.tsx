'use client'

import type { ISubject } from '@/types'
import { AlertCircle, BookOpen, CheckCircle2, Circle, Filter, GraduationCap, Save, Search, Sparkles } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useSchoolYear, useSubject } from '@/hooks'

interface SchoolSubjectsManagerProps {
  schoolId: string
  schoolName?: string
}

function SchoolSubjectsManager({ schoolId, schoolName }: SchoolSubjectsManagerProps) {
  const {
    subjects,
    selectedSubjectIds,
    isLoading,
    error,
    setSelectedSubjects,
    loadSubjects,
    loadSchoolSubjectsForYear,
    saveSelectedSubjectsForYear,
  } = useSubject()

  const { selectedSchoolYearId, schoolYears } = useSchoolYear()
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSelected, setFilterSelected] = useState<'all' | 'selected' | 'unselected'>('all')

  // Load subjects on component mount
  useEffect(() => {
    loadSubjects()
  }, [])

  // Load school subjects when school year changes
  useEffect(() => {
    if (schoolId && selectedSchoolYearId) {
      loadSchoolSubjectsForYear(schoolId, selectedSchoolYearId)
    }
  }, [schoolId, selectedSchoolYearId])

  const toggleSubject = (subjectId: string) => {
    if (selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjects(selectedSubjectIds.filter((id: string) => id !== subjectId))
    }
    else {
      setSelectedSubjects([...selectedSubjectIds, subjectId])
    }
    // Clear success/error messages when user makes changes
    setSaveSuccess(false)
    setSaveError(null)
  }

  const handleSave = async () => {
    if (!selectedSchoolYearId) {
      setSaveError('Veuillez sélectionner une année scolaire')
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await saveSelectedSubjectsForYear(schoolId, selectedSchoolYearId)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
    catch (error) {
      console.error('Failed to save subjects:', error)
      setSaveError(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde')
    }
    finally {
      setIsSaving(false)
    }
  }

  // Filter and search functionality
  const filteredSubjects = useMemo(() => {
    let filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterSelected === 'selected') {
      filtered = filtered.filter(subject => selectedSubjectIds.includes(subject.id))
    }
    else if (filterSelected === 'unselected') {
      filtered = filtered.filter(subject => !selectedSubjectIds.includes(subject.id))
    }

    return filtered
  }, [subjects, searchTerm, filterSelected, selectedSubjectIds])

  const selectedSchoolYear = schoolYears.find(year => year.id === selectedSchoolYearId)

  // Quick actions
  const selectAll = () => {
    setSelectedSubjects(filteredSubjects.map(s => s.id))
    setSaveSuccess(false)
    setSaveError(null)
  }

  const deselectAll = () => {
    setSelectedSubjects([])
    setSaveSuccess(false)
    setSaveError(null)
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive bg-destructive/10 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-destructive/20 p-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold text-destructive-foreground">Erreur de chargement</h3>
            <p className="text-sm text-destructive-foreground/70">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-background to-accent p-6 border border-border">
        <div className="absolute inset-0 bg-muted/10 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-25" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary p-2.5">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Configuration des Matières</h2>
                <p className="text-sm text-muted-foreground">
                  {schoolName && `${schoolName} • `}Année scolaire {selectedSchoolYear?.name || 'Non sélectionnée'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Sparkles className="h-5 w-5" />
                {selectedSubjectIds.length}
                <span className="text-sm font-normal text-muted-foreground">
                  / {subjects.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                matière{selectedSubjectIds.length !== 1 ? 's' : ''} sélectionnée{selectedSubjectIds.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || !selectedSchoolYearId}
              className="px-6 py-2 h-10 rounded-lg font-medium"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Sauvegarde...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="rounded-xl bg-card border border-border p-4 space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterSelected}
              onChange={e => setFilterSelected(e.target.value as any)}
              className="h-10 px-3 text-sm border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value="all">Toutes</option>
              <option value="selected">Sélectionnées</option>
              <option value="unselected">Non sélectionnées</option>
            </select>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="text-xs"
            >
              Tout sélectionner
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAll}
              className="text-xs"
            >
              Tout désélectionner
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredSubjects.length} matière{filteredSubjects.length !== 1 ? 's' : ''} trouvée{filteredSubjects.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {saveSuccess && (
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Configuration sauvegardée</p>
              <p className="text-xs text-muted-foreground">Les matières ont été mises à jour avec succès.</p>
            </div>
          </div>
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/20 p-1.5">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-destructive-foreground">Erreur de sauvegarde</p>
              <p className="text-xs text-destructive-foreground/70">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Grid - Two Column Layout */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array.from({ length: 6 })].map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                <Skeleton className="h-6 w-12 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            {filteredSubjects.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {searchTerm ? 'Aucun résultat trouvé' : 'Aucune matière disponible'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {searchTerm ? `Essayez de modifier votre recherche "${searchTerm}"` : 'Les matières apparaîtront ici une fois configurées.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredSubjects.map((subject: ISubject) => {
                  const isSelected = selectedSubjectIds.includes(subject.id)
                  return (
                    <div
                      key={subject.id}
                      className={`group relative flex items-center gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-accent/50 border ${
                        isSelected ? 'bg-primary/5 border-primary/20' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => toggleSubject(subject.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full transition-colors ${
                              isSelected
                                ? 'bg-primary'
                                : 'bg-muted-foreground/30'
                            }`}
                            />
                            <label
                              className="text-sm font-medium text-foreground cursor-pointer truncate"
                              onClick={() => toggleSubject(subject.id)}
                            >
                              {subject.name}
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Activée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs px-2 py-1 text-muted-foreground">
                            <Circle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SchoolSubjectsManager
