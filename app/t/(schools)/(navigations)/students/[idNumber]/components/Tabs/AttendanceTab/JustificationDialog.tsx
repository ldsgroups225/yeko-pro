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
import { justifyAttendance } from '@/services/attendanceService'
import { ConfirmationDialog } from './ConfirmationDialog'

interface JustificationDialogProps {
  isOpen: boolean
  onClose: () => void
  attendanceId: string
  studentName: string
  attendanceType: 'absence' | 'late'
  attendanceDate: string
  onJustified: () => void
}

export function JustificationDialog({
  isOpen,
  onClose,
  attendanceId,
  studentName,
  attendanceType,
  attendanceDate,
  onJustified,
}: JustificationDialogProps) {
  const [justificationImage, setJustificationImage] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleImageSelected = (image: string | null) => {
    setJustificationImage(image)
  }

  const handleSubmit = async () => {
    if (!justificationImage) {
      toast.error('Veuillez sélectionner une image de justification')
      return
    }

    if (!reason.trim()) {
      toast.error('Veuillez saisir une raison pour la justification')
      return
    }

    setIsSubmitting(true)
    try {
      await justifyAttendance(attendanceId, reason.trim(), justificationImage)
      toast.success('Justification enregistrée avec succès')
      onJustified()
      onClose()
      setJustificationImage(null)
      setReason('')
    }
    catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la justification')
    }
    finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setJustificationImage(null)
      setReason('')
      setShowConfirmation(false)
      onClose()
    }
  }

  const handleShowConfirmation = () => {
    if (!justificationImage) {
      toast.error('Veuillez sélectionner une image de justification')
      return
    }

    if (!reason.trim()) {
      toast.error('Veuillez saisir une raison pour la justification')
      return
    }

    setShowConfirmation(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmation(false)
    handleSubmit()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Justifier
              {' '}
              {attendanceType === 'absence' ? 'l\'absence' : 'le retard'}
            </DialogTitle>
            <DialogDescription>
              Téléchargez une image de justification et saisissez la raison
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
                value={reason}
                onChange={e => setReason(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Image de justification *</Label>
              <ImageUpload
                value={justificationImage}
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
              disabled={!justificationImage || !reason.trim() || isSubmitting}
            >
              Confirmer et envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        studentName={studentName}
        attendanceType={attendanceType}
        attendanceDate={attendanceDate}
        reason={reason}
        imagePreview={justificationImage}
        isSubmitting={isSubmitting}
      />
    </>
  )
}
