'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface PaymentRecord {
  id: string
  date: string
  category: string
  amount: number
  method: 'cash' | 'bank_transfer' | 'mobile_money'
  reference?: string
}

interface PaymentHistoryProps {
  payments: PaymentRecord[]
  isLoading?: boolean
}

function formatPaymentMethod(method: PaymentRecord['method']) {
  const labels = {
    cash: 'Espèces',
    bank_transfer: 'Virement bancaire',
    mobile_money: 'Mobile Money',
  }
  return labels[method]
}

function PaymentRow({ payment }: { payment: PaymentRecord }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="font-medium">{payment.category}</div>
        <div className="text-sm text-muted-foreground">{payment.date}</div>
      </div>
      <div className="flex flex-col items-end">
        <Badge className="bg-green-500">
          {payment.amount.toLocaleString('fr-FR')}
          {' '}
          FCFA
        </Badge>
        <span className="text-xs text-muted-foreground mt-1">
          {formatPaymentMethod(payment.method)}
          {payment.reference && ` - Réf: ${payment.reference}`}
        </span>
      </div>
    </div>
  )
}

function PaymentRowSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex flex-col items-end">
        <Skeleton className="h-6 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function PaymentHistory({ payments, isLoading }: PaymentHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <PaymentRowSkeleton />
            <PaymentRowSkeleton />
            <PaymentRowSkeleton />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des Paiements</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length > 0
          ? (
              <div className="space-y-6">
                {payments.map(payment => (
                  <PaymentRow key={payment.id} payment={payment} />
                ))}
              </div>
            )
          : (
              <div className="text-center text-muted-foreground py-8">
                Aucun paiement enregistré
              </div>
            )}
      </CardContent>
    </Card>
  )
}
