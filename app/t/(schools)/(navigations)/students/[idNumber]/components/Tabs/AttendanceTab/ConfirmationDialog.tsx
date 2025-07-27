'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  studentName: string
  attendanceType: 'absence' | 'late'
  attendanceDate: string
  reason: string
  imagePreview: string | null
  isSubmitting: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  attendanceType,
  attendanceDate,
  reason,
  imagePreview,
  isSubmitting,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirmer la justification</DialogTitle>
          <DialogDescription>
            Veuillez confirmer les détails de la justification avant l'envoi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Détails de la justification</h4>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Étudiant:</span>
                {' '}
                {studentName}
              </p>
              <p>
                <span className="font-medium">Type:</span>
                {' '}
                {attendanceType === 'absence' ? 'Absence' : 'Retard'}
              </p>
              <p>
                <span className="font-medium">Date:</span>
                {' '}
                {attendanceDate}
              </p>
              <p>
                <span className="font-medium">Raison:</span>
                {' '}
                {reason}
              </p>
            </div>
          </div>

          {imagePreview && (
            <div className="space-y-2">
              <h4 className="font-medium">Image de justification</h4>
              <div className="border rounded-lg p-2">
                <img
                  src={imagePreview}
                  alt="Aperçu de la justification"
                  className="max-w-full h-auto max-h-48 object-contain"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Modifier
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : 'Confirmer et envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
