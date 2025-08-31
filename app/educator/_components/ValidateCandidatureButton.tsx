'use client'

import type { IPendingInscription } from '../types'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { handleCandidature } from '../actions'

interface Props {
  gradeId: number | null
  classes: { id: string, name: string, gradeId: number, remainingSeats: number }[]
  affectedToClass: string | null
  student: IPendingInscription
}

interface StudentClassSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  studentId: string
  studentName: string
  studentGrade: number
  classes: { id: string, name: string, remainingSeats: number }[]
  onConfirm: (classId: string) => Promise<void>
}

function StudentClassSelectionDialog({
  isOpen,
  onClose,
  classes,
  studentId: _studentId,
  studentName,
  studentGrade: _studentGrade,
  onConfirm,
}: StudentClassSelectionDialogProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!selectedClassId)
      return
    setIsLoading(true)
    try {
      await onConfirm(selectedClassId)
      onClose()
    }
    catch (error) {
      console.error('Error assigning class:', error)
      toast.error('Erreur lors de l\'attribution de la classe')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Choisir une classe pour
            {' '}
            {studentName}
          </DialogTitle>
          <DialogDescription>
            Veuillez choisir une classe pour l&apos;élève.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une classe" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id} className="flex justify-between w-full">
                  <span>{c.name}</span>
                  <span className="ml-4 text-xs text-muted-foreground">
                    {c.remainingSeats > 1 ? `(${c.remainingSeats} places restantes)` : '(Dernière place)'}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedClassId || isLoading}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  onConfirm: () => Promise<void>
  confirmText?: string
  cancelText?: string
}

function ConfirmationDialog({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    }
    catch (error) {
      console.error('Error in confirmation:', error)
      toast.error('Une erreur est survenue')
    }
    finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ValidateCandidatureButton({ gradeId: _gradeId, affectedToClass, classes, student }: Props) {
  const hasAlreadyAffectedToClass = affectedToClass !== null

  const [isClassSelectionOpen, setIsClassSelectionOpen] = useState(false)
  const [isAcceptConfirmationOpen, setIsAcceptConfirmationOpen] = useState(false)
  const [isRejectConfirmationOpen, setIsRejectConfirmationOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleAcceptCandidature(classId?: string) {
    setIsLoading(true)
    try {
      await handleCandidature(student.candidateId, 'student', 'accept', classId)
      toast.success('Candidature acceptée avec succès')
    }
    catch (error) {
      console.error('Error accepting candidature:', error)
      toast.error('Erreur lors de l\'acceptation de la candidature')
      throw error
    }
    finally {
      setIsLoading(false)
    }
  }

  async function handleRefuseCandidature() {
    setIsLoading(true)
    try {
      await handleCandidature(student.candidateId, 'student', 'reject')
      toast.success('Candidature refusée')
    }
    catch (error) {
      console.error('Error rejecting candidature:', error)
      toast.error('Erreur lors du refus de la candidature')
      throw error
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleAcceptClick = () => {
    if (hasAlreadyAffectedToClass) {
      // If already assigned to a class, show confirmation to accept
      setIsAcceptConfirmationOpen(true)
    }
    else {
      // If not assigned to a class, show class selection dialog
      setIsClassSelectionOpen(true)
    }
  }

  const handleRejectClick = () => {
    setIsRejectConfirmationOpen(true)
  }

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleAcceptClick}
          disabled={isLoading}
          className="font-medium"
        >
          {hasAlreadyAffectedToClass ? 'Accepter' : 'Accepter et affecter'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRejectClick}
          disabled={isLoading}
          className="font-medium"
        >
          Refuser
        </Button>
      </div>

      {/* Class Selection Dialog */}
      <StudentClassSelectionDialog
        isOpen={isClassSelectionOpen}
        onClose={() => setIsClassSelectionOpen(false)}
        studentId={student.candidateId}
        studentName={student.name}
        studentGrade={student.grade || 0}
        classes={classes.filter(c => c.gradeId === student.grade)}
        onConfirm={handleAcceptCandidature}
      />

      {/* Accept Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isAcceptConfirmationOpen}
        onClose={() => setIsAcceptConfirmationOpen(false)}
        title="Confirmer l'acceptation"
        description={`Êtes-vous sûr de vouloir accepter la candidature de ${student.name} ?`}
        onConfirm={() => handleAcceptCandidature(affectedToClass || undefined)}
        confirmText="Accepter"
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isRejectConfirmationOpen}
        onClose={() => setIsRejectConfirmationOpen(false)}
        title="Confirmer le refus"
        description={`Êtes-vous sûr de vouloir refuser la candidature de ${student.name} ?`}
        onConfirm={handleRefuseCandidature}
        confirmText="Refuser"
        cancelText="Annuler"
      />
    </>
  )
}
