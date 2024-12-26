import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { nanoid } from 'nanoid'
import React from 'react'

export function MetricsCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map(() => (
        <Card key={nanoid()}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}
