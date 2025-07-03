'use client'

import type { InstallmentTemplate } from '@/validations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DeleteInstallmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  installment: InstallmentTemplate | null
  isLoading?: boolean
}

export function DeleteInstallmentDialog({
  isOpen,
  onClose,
  onConfirm,
  installment,
  isLoading = false,
}: DeleteInstallmentDialogProps) {
  if (!installment)
    return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer la tranche de paiement</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer la tranche de paiement du
            {' '}
            <strong>{formatDate(installment.dueDate, 'dd MMM yyyy')}</strong>
            {' '}
            d'un montant de
            {' '}
            <strong>{formatCurrency(installment.fixedAmount ?? 0)}</strong>
            {' '}
            ?
            <br />
            <br />
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
