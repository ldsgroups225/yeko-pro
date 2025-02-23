'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check, Download, Printer } from 'lucide-react'

interface PaymentDetails {
  reference: string
  amount: number
  studentName: string
  className: string
  schoolName: string
  paymentMethod: string
  phoneNumber: string
  timestamp: string
}

interface ConfirmationStepProps {
  payment: PaymentDetails
  onDownloadReceipt: () => void
  onPrintReceipt: () => void
  isLoading?: boolean
}

export function ConfirmationStep({
  payment,
  onDownloadReceipt,
  onPrintReceipt,
  isLoading = false,
}: ConfirmationStepProps) {
  if (isLoading) {
    return (
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Paiement réussi!</h3>
        <p className="text-sm text-muted-foreground">
          Votre paiement a été traité avec succès
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className={cn(
          'rounded-lg p-4',
          'bg-background/50',
        )}
        >
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Référence</span>
              <span className="text-sm font-medium">{payment.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Montant</span>
              <span className="text-sm font-medium">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                }).format(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Élève</span>
              <span className="text-sm font-medium">{payment.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Classe</span>
              <span className="text-sm font-medium">{payment.className}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">École</span>
              <span className="text-sm font-medium">{payment.schoolName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Méthode</span>
              <span className="text-sm font-medium">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Téléphone</span>
              <span className="text-sm font-medium">{payment.phoneNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm font-medium">
                {new Date(payment.timestamp).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onDownloadReceipt}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
          <Button
            variant="outline"
            onClick={onPrintReceipt}
            className="flex-1"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
