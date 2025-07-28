'use client'

import type { StudentWithPaymentStatus } from '@/types/accounting'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatTimePassed } from '@/lib/utils'
import { NotifyIndividualParentButton } from './notify-individual-parent-button'
import { StudentPaymentsTableSkeleton } from './student-payments-table-skeleton'

interface StudentPaymentsTableProps {
  students: StudentWithPaymentStatus[]
  isLoading?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => Promise<void>
}

export function StudentPaymentsTable({
  students,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
}: StudentPaymentsTableProps) {
  const trStyle = 'border-b transition-colors'
  const thStyle = 'h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]'
  const tdStyle = 'p-1 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]'

  // Infinite scroll detection
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!onLoadMore || !hasMore || isLoadingMore)
      return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, isLoadingMore])

  if (isLoading) {
    return <StudentPaymentsTableSkeleton />
  }

  if (!students || students.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-center text-muted-foreground">
        Aucun élève trouvé.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <table className="w-full caption-bottom text-sm text-muted-foreground">
        <thead className="[&_tr]:border-b">
          <tr className={trStyle}>
            <th className={cn(thStyle, 'text-left')}>Nom</th>
            <th className={cn(thStyle, 'text-center w-[90px]')}>Matricule</th>
            <th className={cn(thStyle, 'text-center w-[70px]')}>Classe</th>
            <th className={cn(thStyle, 'text-center w-[160px]')}>Dernier paiement</th>
            <th className={cn(thStyle, 'text-right w-[110px]')}>Reste à payer</th>
            <th className={cn(thStyle, 'text-end w-[120px]')}>Statut</th>
            <th className={cn(thStyle, 'text-end w-[20px]')}></th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {students.map(student => (
            <tr key={student.id} className={trStyle}>
              <td className={cn(tdStyle, 'text-left')}>{student.name}</td>
              <td className={cn(tdStyle, 'text-center w-[90px]')}>{student.idNumber}</td>
              <td className={cn(tdStyle, 'text-center w-[70px]')}>{student.classroom}</td>
              <td className={cn(tdStyle, 'text-center text-sm w-[160px]')}>
                {
                  student.lastPaymentDate === null
                    ? '-'
                    : formatTimePassed(student.lastPaymentDate, true)
                }
              </td>
              <td className={cn(tdStyle, 'text-end w-[110px]')}>
                {
                  student.remainingAmount === 0
                    ? (
                        <Badge variant="success">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </Badge>
                      )
                    : formatCurrency(student.remainingAmount, true)
                }
              </td>
              <td className={cn(tdStyle, 'text-end w-[120px]')}>
                <Badge
                  variant={student.paymentStatus === 'paid' ? 'success' : 'outline'}
                  className={student.paymentStatus !== 'paid' ? 'text-white bg-red-500 border-red-500' : ''}
                >
                  {student.paymentStatus === 'paid' ? 'A jour' : `-${formatCurrency(student.remainingAmount, true)}`}
                </Badge>
              </td>
              <td className={cn(tdStyle, 'text-end w-[20px]')}>
                {
                  student.paymentStatus !== 'paid' && (
                    <NotifyIndividualParentButton
                      studentId={student.id}
                      studentName={student.name}
                      studentClassroom={student.classroom}
                    />
                  )
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Infinite scroll trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex justify-center py-4"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Chargement...</span>
            </div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && students.length > 0 && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          Tous les résultats ont été affichés
        </div>
      )}
    </div>
  )
}
