'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface Observation {
  id: string
  content: string
  teacher: {
    name: string
    role: string
  }
  date: string
}

interface TeacherObservationsProps {
  observations: Observation[]
  isLoading?: boolean
}

function ObservationCard({ observation }: { observation: Observation }) {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <p className="text-sm">{observation.content}</p>
      <div className="mt-2 text-sm text-muted-foreground">
        -
        {' '}
        {observation.teacher.name}
        ,
        {' '}
        {observation.teacher.role}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {observation.date}
      </div>
    </div>
  )
}

function ObservationCardSkeleton() {
  return (
    <div className="p-4 bg-muted rounded-lg">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-2">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="mt-1">
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

export function TeacherObservations({ observations, isLoading }: TeacherObservationsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ObservationCardSkeleton />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {observations.length > 0
            ? (
                observations.map(observation => (
                  <ObservationCard key={observation.id} observation={observation} />
                ))
              )
            : (
                <p className="text-sm text-muted-foreground">
                  Aucune observation pour le moment
                </p>
              )}
        </div>
      </CardContent>
    </Card>
  )
}
