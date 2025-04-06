'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface Absence {
  id: string
  date: string
  type: 'absence' | 'late'
  status: 'justified' | 'unjustified'
  reason?: string
  duration?: string
}

interface AbsenceHistoryProps {
  absences: Absence[]
  isLoading?: boolean
}

function AbsenceRow({ absence }: { absence: Absence }) {
  return (
    <div className="flex justify-between text-sm">
      <span>{absence.date}</span>
      <div className="flex items-center gap-2">
        <Badge
          variant={absence.type === 'absence' ? 'destructive' : 'default'}
          className="w-24 justify-center items-center"
        >
          {absence.type === 'absence' ? 'Absence' : 'Retard'}
        </Badge>
        <Badge
          variant={absence.status === 'justified' ? 'outline' : 'secondary'}
          className="w-24 justify-center items-center"
        >
          {absence.status === 'justified' ? 'Justifié' : 'Non justifié'}
        </Badge>
      </div>
      <span
        className={cn(
          'text-muted-foreground',
          absence.reason && 'font-bold text-primary',
        )}
      >
        {absence.reason || 'pas de raison'}
      </span>
    </div>
  )
}

function AbsenceRowSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function AbsenceHistory({ absences, isLoading }: AbsenceHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="text-sm font-medium">Dernières absences:</div>
            <div className="space-y-4">
              <AbsenceRowSkeleton />
              <AbsenceRowSkeleton />
              <AbsenceRowSkeleton />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (absences.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground text-center py-4">
            Aucune absence enregistrée
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="text-sm font-medium">Dernières absences:</div>
          <div className="space-y-4">
            {absences.map(absence => (
              <AbsenceRow key={absence.id} absence={absence} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
