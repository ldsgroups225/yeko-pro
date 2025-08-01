'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateAttendanceJustification } from '@/services/attendanceService'
import { ConfirmationDialog } from './ConfirmationDialog'

interface EditJustificationDialogProps {
  isOpen: boolean
  onClose: () => void
  attendanceId: string
  studentName: string
  attendanceType: 'absence' | 'late'
  attendanceDate: string
  currentReason: string
  currentImageUrl: string
  onJustified: () => void
}

export function EditJustificationDialog({
  isOpen,
  onClose,
  attendanceId,
  studentName,
  attendanceType,
  attendanceDate,
  currentReason,
  currentImageUrl,
  onJustified,
}: EditJustificationDialogProps) {
  const [formState, setFormState] = useState({
    justificationImage: currentImageUrl as string | null,
    reason: currentReason,
    showConfirmation: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageSelected = (image: string | null) => {
    setFormState(prev => ({ ...prev, justificationImage: image }))
  }

  const handleSubmit = async () => {
    if (!formState.justificationImage) {
      toast.error('Veuillez sélectionner une image de justification')
      return
    }

    if (!formState.reason.trim()) {
      toast.error('Veuillez saisir une raison pour la justification')
      return
    }

    setIsSubmitting(true)
    try {
      await updateAttendanceJustification(attendanceId, formState.reason.trim(), formState.justificationImage)
      toast.success('Justification mise à jour avec succès')
      onJustified()
      onClose()
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setFormState({
        justificationImage: currentImageUrl,
        reason: currentReason,
        showConfirmation: false,
      })
      onClose()
    }
  }

  const handleShowConfirmation = () => {
    if (!formState.justificationImage) {
      toast.error('Veuillez sélectionner une image de justification')
      return
    }

    if (!formState.reason.trim()) {
      toast.error('Veuillez saisir une raison pour la justification')
      return
    }

    setFormState(prev => ({ ...prev, showConfirmation: true }))
  }

  const handleConfirmSubmit = () => {
    setFormState(prev => ({ ...prev, showConfirmation: false }))
    handleSubmit()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose} key={isOpen ? 'open' : 'closed'}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Modifier la justification
              {' '}
              {attendanceType === 'absence' ? 'de l\'absence' : 'du retard'}
            </DialogTitle>
            <DialogDescription>
              Modifiez la raison et l'image de justification
              {' '}
              {attendanceType === 'absence' ? 'de l\'absence' : 'du retard'}
              {' '}
              de
              {' '}
              <span className="font-medium">{studentName}</span>
              {' '}
              du
              {' '}
              {attendanceDate}
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Raison de la justification *</Label>
              <Textarea
                id="reason"
                placeholder="Saisissez la raison de la justification..."
                value={formState.reason}
                onChange={e => setFormState(prev => ({ ...prev, reason: e.target.value }))}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image de justification *</Label>
              <ImageUpload
                value={formState.justificationImage}
                onChange={handleImageSelected}
                disabled={isSubmitting}
                label="image de justification"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleShowConfirmation}
              disabled={!formState.justificationImage || !formState.reason.trim() || isSubmitting}
            >
              Confirmer et mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={formState.showConfirmation}
        onClose={() => setFormState(prev => ({ ...prev, showConfirmation: false }))}
        onConfirm={handleConfirmSubmit}
        studentName={studentName}
        attendanceType={attendanceType}
        attendanceDate={attendanceDate}
        reason={formState.reason}
        imagePreview={formState.justificationImage}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
