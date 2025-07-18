import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { useStudents } from '@/hooks'

interface ParentLinkModalProps {
  studentName: string
  studentIdNumber: string
  hasAlreadyParent: boolean
  onClose: () => void
}

export function ParentLinkModal({
  hasAlreadyParent,
  studentIdNumber,
  studentName,
  onClose,
}: ParentLinkModalProps) {
  const { linkStudentAndParent } = useStudents()

  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)

  const openConfirmationModal = () => {
    if (otp.length !== 6) {
      setLocalError('Le code OTP doit contenir 6 chiffres.')
      return
    }
    setIsConfirmationDialogOpen(true)
  }
  const submitOTP = async () => {
    setIsLoading(true)
    setLocalError('')
    try {
      const success = await linkStudentAndParent({
        studentIdNumber,
        otp,
      })

      if (success) {
        onClose()
      }
      else {
        toast.error('Une erreur est survenue lors de la liaison.')
      }
    }
    catch (error) {
      toast.error((error as Error).message)
    }
    finally {
      setIsLoading(false)
      setIsConfirmationDialogOpen(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader className="flex flex-row items-center justify-between">
        <DialogTitle>
          L'élève
          {' '}
          {studentName}
        </DialogTitle>
      </DialogHeader>

      {
        hasAlreadyParent && (
          <Alert variant="destructive">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Cet élève a déjà un parent</AlertTitle>
          </Alert>
        )
      }

      <DialogDescription className="mb-4">
        Veuillez saisir le code OTP fourni par le parent.
      </DialogDescription>

      <div className="flex justify-center">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={value => setOtp(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      {localError && (
        <Alert variant="destructive" className="mt-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>{localError}</AlertTitle>
        </Alert>
      )}

      <DialogFooter className="flex justify-end space-x-3">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Annuler
        </Button>
        <Button
          onClick={openConfirmationModal}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Lier'}
        </Button>
      </DialogFooter>

      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la liaison</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir lier cet élève à son parent avec le code OTP fourni ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmationDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={submitOTP}
              disabled={isLoading}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogContent>
  )
}
