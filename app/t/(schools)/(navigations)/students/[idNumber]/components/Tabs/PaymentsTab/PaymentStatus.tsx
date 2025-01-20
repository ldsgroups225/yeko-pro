'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface PaymentStatusItem {
  id: string
  category: string
  amount: number
  status: 'paid' | 'pending' | 'late'
  dueDate?: string
}

interface PaymentStatusProps {
  payments: PaymentStatusItem[]
  isLoading?: boolean
}

function StatusBadge({ status }: { status: PaymentStatusItem['status'] }) {
  const variants = {
    paid: 'bg-green-500',
    pending: 'bg-yellow-500',
    late: 'bg-red-500',
  }

  const labels = {
    paid: 'À jour',
    pending: 'En attente',
    late: 'En retard',
  }

  return (
    <Badge className={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

function PaymentStatusCard({ payment }: { payment: PaymentStatusItem }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground">
          {payment.category}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-bold">
            {payment.amount.toLocaleString('fr-FR')}
            {' '}
            FCFA
          </span>
          <StatusBadge status={payment.status} />
        </div>
        {payment.dueDate && payment.status !== 'paid' && (
          <div className="mt-2 text-sm text-muted-foreground">
            Échéance:
            {' '}
            {payment.dueDate}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PaymentStatusCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-4 w-24 mb-2" />
        <div className="flex items-center justify-between mt-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-28 mt-2" />
      </CardContent>
    </Card>
  )
}

export function PaymentStatus({ payments, isLoading }: PaymentStatusProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PaymentStatusCardSkeleton />
        <PaymentStatusCardSkeleton />
        <PaymentStatusCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {payments.map(payment => (
        <PaymentStatusCard key={payment.id} payment={payment} />
      ))}
    </div>
  )
}
