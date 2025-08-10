'use client'

import type { IConductIncident } from '@/types'
import { AlertTriangle, Calendar, FileText, Minus, Plus, Save, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CONDUCT_CATEGORIES, CONDUCT_DEDUCTIONS } from '@/types/conduct'

interface IncidentModalProps {
  studentId: string
  onClose: () => void
  onIncidentCreated: () => void
}

interface IncidentForm {
  categoryId: string
  description: string
  pointsDeducted: number
  customPoints: boolean
}

export function IncidentModal({ studentId, onClose, onIncidentCreated }: IncidentModalProps) {
  const [form, setForm] = useState<IncidentForm>({
    categoryId: '',
    description: '',
    pointsDeducted: 0,
    customPoints: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Predefined incident types with their point deductions
  // Note: Late arrival is commented out as per ministry guidelines update
  const incidentTypes = [
    // { id: 'late_arrival', name: 'Retard', category: 'attendance', points: CONDUCT_DEDUCTIONS.LATE_ARRIVAL },
    { id: 'unjustified_absence', name: 'Absence injustifiée', category: 'attendance', points: CONDUCT_DEDUCTIONS.UNJUSTIFIED_ABSENCE_HOUR },
    { id: 'dress_violation', name: 'Tenue non conforme', category: 'dresscode', points: CONDUCT_DEDUCTIONS.DRESS_CODE_VIOLATION },
    { id: 'fraud_attempt', name: 'Tentative de fraude', category: 'morality', points: CONDUCT_DEDUCTIONS.FRAUD_ATTEMPT },
    { id: 'confirmed_fraud', name: 'Fraude confirmée', category: 'morality', points: CONDUCT_DEDUCTIONS.CONFIRMED_FRAUD },
    { id: 'theft', name: 'Vol/Extorsion', category: 'morality', points: CONDUCT_DEDUCTIONS.THEFT },
    { id: 'disrespect_staff', name: 'Irrespect envers le personnel', category: 'discipline', points: CONDUCT_DEDUCTIONS.DISRESPECT_STAFF },
    { id: 'classroom_disruption', name: 'Perturbation en classe', category: 'discipline', points: CONDUCT_DEDUCTIONS.CLASSROOM_DISRUPTION },
    { id: 'violence', name: 'Violence physique', category: 'discipline', points: CONDUCT_DEDUCTIONS.VIOLENCE },
    { id: 'property_damage', name: 'Dégradation de biens', category: 'discipline', points: CONDUCT_DEDUCTIONS.PROPERTY_DAMAGE },
  ]

  const handleIncidentTypeChange = (incidentTypeId: string) => {
    const incidentType = incidentTypes.find(type => type.id === incidentTypeId)
    if (incidentType) {
      setForm(prev => ({
        ...prev,
        categoryId: incidentType.category,
        pointsDeducted: incidentType.points,
        customPoints: false,
      }))
    }
  }

  // const handleCustomPointsToggle = () => {
  //   setForm(prev => ({
  //     ...prev,
  //     customPoints: !prev.customPoints,
  //     pointsDeducted: prev.customPoints ? 0 : prev.pointsDeducted,
  //   }))
  // }

  const adjustPoints = (delta: number) => {
    setForm(prev => ({
      ...prev,
      pointsDeducted: Math.max(0, Math.min(20, prev.pointsDeducted + delta)),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.categoryId || !form.description.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (form.pointsDeducted <= 0) {
      toast.error('Le nombre de points déduits doit être supérieur à 0')
      return
    }

    if (form.description.length < 10) {
      toast.error('La description doit contenir au moins 10 caractères')
      return
    }

    setIsSubmitting(true)

    try {
      const { createConductIncident } = await import('@/services/conductService')

      const currentDate = new Date().toISOString()

      const incident: Omit<IConductIncident, 'id' | 'createdAt' | 'updatedAt'> = {
        studentId,
        categoryId: form.categoryId,
        description: form.description,
        pointsDeducted: form.pointsDeducted,
        reportedBy: '', // Will be set by the service from auth context
        reportedAt: currentDate,
        schoolYearId: 0, // Will be set by the service from current school year
        semesterId: 0, // Will be set by the service from current semester
        isActive: true,
      }

      await createConductIncident(incident)

      toast.success('Incident enregistré avec succès')
      onIncidentCreated()
      onClose()
    }
    catch (error) {
      console.error('Error creating incident:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'enregistrement de l\'incident'
      toast.error(errorMessage)
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = CONDUCT_CATEGORIES.find(cat => cat.id === form.categoryId)

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Signaler un Incident de Conduite
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Incident Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Type d'incident *</Label>
          <Select onValueChange={handleIncidentTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type d'incident" />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{type.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      -
                      {type.points}
                      {' '}
                      pts
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Display */}
        {selectedCategory && (
          <Card className="border-l-4" style={{ borderLeftColor: selectedCategory.color.replace('bg-', '#') }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${selectedCategory.color}`} />
                {selectedCategory.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">
                {selectedCategory.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Points Deduction */}
        <div className="space-y-3">
          {/* <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Points déduits *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCustomPointsToggle}
              className="text-xs"
            >
              {form.customPoints ? 'Utiliser valeur standard' : 'Personnaliser'}
            </Button>
          </div> */}

          {form.customPoints
            ? (
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adjustPoints(-0.5)}
                    disabled={form.pointsDeducted <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={form.pointsDeducted}
                    onChange={e => setForm(prev => ({ ...prev, pointsDeducted: Number(e.target.value) }))}
                    className="text-center w-20"
                    min="0"
                    max="20"
                    step="0.5"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => adjustPoints(0.5)}
                    disabled={form.pointsDeducted >= 20}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">/ 20 points</span>
                </div>
              )
            : (
                <div className="flex items-center space-x-2">
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <span className="text-lg font-bold text-red-600">
                      -
                      {form.pointsDeducted}
                    </span>
                    <span className="text-sm text-red-500 ml-1">points</span>
                  </div>
                </div>
              )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Description détaillée *</Label>
          <Textarea
            placeholder="Décrivez l'incident en détail (circonstances, témoins, mesures prises...)"
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[100px]"
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimum 10 caractères. Soyez précis et objectif dans votre description.
          </p>
        </div>

        {/* Date and Reporter Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date de l'incident</Label>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Signalé par</Label>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Utilisateur actuel</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.categoryId || !form.description.trim()}
          >
            {isSubmitting
              ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Enregistrement...</span>
                  </div>
                )
              : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Enregistrer l'incident</span>
                  </div>
                )}
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}
