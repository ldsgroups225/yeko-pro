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
import { justifyAttendance } from '@/services/attendanceService'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!justificationImage) {
      toast.error('Veuillez sélectionner une image de justification')
      return
    }

    setIsSubmitting(true)
    try {
      await justifyAttendance(attendanceId, justificationImage)
      toast.success('Justification enregistrée avec succès')
      onJustified()
      onClose()
      setJustificationImage(null)
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
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Justifier l&apos;
            {attendanceType === 'absence' ? 'absence' : 'retard'}
          </DialogTitle>
          <DialogDescription>
            Téléchargez une image de justification pour l&apos;
            {attendanceType === 'absence' ? 'absence' : 'retard'}
            {' '}
            de
            {' '}
            <span className="font-medium">{studentName}</span>
            {' '}
            du
            {attendanceDate}
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            value={justificationImage}
            onChange={setJustificationImage}
            disabled={isSubmitting}
            label="justification"
          />
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
            onClick={handleSubmit}
            disabled={!justificationImage || isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Justifier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
