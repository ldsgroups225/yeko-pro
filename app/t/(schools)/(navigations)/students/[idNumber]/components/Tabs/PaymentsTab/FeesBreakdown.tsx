'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export interface FeeCategory {
  id: string
  name: string
  totalAmount: number
  paidAmount: number
  dueDate: string
  description?: string
  isOptional: boolean
}

interface FeesBreakdownProps {
  fees: FeeCategory[]
  isLoading?: boolean
}

function FeeCategoryRow({ fee }: { fee: FeeCategory }) {
  const progressPercentage = (fee.paidAmount / fee.totalAmount) * 100
  const remainingAmount = fee.totalAmount - fee.paidAmount

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div>
          <div className="font-medium">
            {fee.name}
            {fee.isOptional && (
              <span className="text-sm text-muted-foreground ml-2">(Optionnel)</span>
            )}
          </div>
          {fee.description && (
            <div className="text-sm text-muted-foreground">{fee.description}</div>
          )}
        </div>
        <div className="text-right">
          <div className="font-medium">
            {fee.paidAmount.toLocaleString('fr-FR')}
            {' '}
            /
            {fee.totalAmount.toLocaleString('fr-FR')}
            {' '}
            FCFA
          </div>
          <div className="text-sm text-muted-foreground">
            Échéance:
            {' '}
            {fee.dueDate}
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <Progress
          value={progressPercentage}
          className="h-2"
          aria-label={`${fee.name} payment progress`}
        />
        {remainingAmount > 0 && (
          <div className="text-xs text-muted-foreground">
            Reste à payer:
            {' '}
            {remainingAmount.toLocaleString('fr-FR')}
            {' '}
            FCFA
          </div>
        )}
      </div>
    </div>
  )
}

function FeeCategoryRowSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-5 w-40 mb-1" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="text-right">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-1">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export function FeesBreakdown({ fees, isLoading }: FeesBreakdownProps) {
  const totalAmount = fees.reduce((sum, fee) => sum + fee.totalAmount, 0)
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0)
  const totalProgress = (totalPaid / totalAmount) * 100

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Détail des Frais</CardTitle>
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <FeeCategoryRowSkeleton />
          <FeeCategoryRowSkeleton />
          <FeeCategoryRowSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Détail des Frais</CardTitle>
        <div className="space-y-2">
          <div className="font-medium">
            Total payé:
            {' '}
            {totalPaid.toLocaleString('fr-FR')}
            {' '}
            /
            {' '}
            {totalAmount.toLocaleString('fr-FR')}
            {' '}
            FCFA
          </div>
          <Progress
            value={totalProgress}
            className="h-2"
            aria-label="Total payment progress"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {fees.map(fee => (
          <FeeCategoryRow key={fee.id} fee={fee} />
        ))}
      </CardContent>
    </Card>
  )
}
