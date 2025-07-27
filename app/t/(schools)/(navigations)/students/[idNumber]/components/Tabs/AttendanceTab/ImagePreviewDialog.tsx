'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ImagePreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  studentName: string
  attendanceDate: string
  attendanceType: 'absence' | 'late'
}

export function ImagePreviewDialog({
  isOpen,
  onClose,
  imageUrl,
  studentName,
  attendanceDate,
  attendanceType,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Aperçu de la justification -
            {' '}
            {studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
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
          </div>

          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt="Aperçu de la justification"
              className="max-w-full h-auto object-contain border rounded-lg"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
