'use client'

import { nanoid } from 'nanoid'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function QuickStatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array.from({ length: 4 })].map(() => (
        <Card key={nanoid()}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-2 w-full mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
