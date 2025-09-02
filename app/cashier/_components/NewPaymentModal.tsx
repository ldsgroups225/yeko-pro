'use client'

import type { StudentForPayment } from '@/types/accounting'
import { DollarSign, User } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createPayment } from '../actions/cashierServices'
import { PaymentForm } from './PaymentForm'
import { StudentInformation } from './StudentInformation'

interface NewPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedStudent?: StudentForPayment
}

export function NewPaymentModal({
  open,
  onOpenChange,
  selectedStudent,
}: NewPaymentModalProps) {
  const handlePayment = async (values: { amount: string, paymentMethod: string, reference?: string }) => {
    try {
      await createPayment(selectedStudent!.id, Number(values.amount), values.paymentMethod)

      toast.success('Paiement effectué avec succès.')
      onOpenChange(false)
    }
    catch (error) {
      console.error(`Failed to process payment: ${error}`)
      toast.error((error as Error).message || 'Erreur lors du traitement du paiement')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Nouveau Paiement
          </DialogTitle>
          <DialogDescription>
            Enregistrer un nouveau paiement pour l'étudiant sélectionné
          </DialogDescription>
        </DialogHeader>

        {selectedStudent
          ? (
              <div className="space-y-6">
                <StudentInformation student={selectedStudent} />
                {selectedStudent.financialInfo.remainingBalance > 0
                  ? (
                      <PaymentForm
                        defaultAmount={selectedStudent.financialInfo.installmentAmount}
                        onSubmit={handlePayment}
                      />
                    )
                  : (
                      <Card className="text-center text-muted-foreground border-2 bg-green-50 border-dotted border-green-500">
                        <CardHeader>
                          <CardTitle>
                            Bravo
                          </CardTitle>
                          <CardDescription>
                            Cet élève est à jour.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    )}
              </div>
            )
          : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun étudiant sélectionné</p>
                <p className="text-sm">Veuillez d'abord rechercher un étudiant</p>
              </div>
            )}
      </DialogContent>
    </Dialog>
  )
}
