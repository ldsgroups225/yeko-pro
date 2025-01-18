import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { nanoid } from 'nanoid'
import React from 'react'

export function MetricsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map(() => (
        <Card key={nanoid()} className="h-full">
          <CardHeader className="flex items-center justify-between pb-2">
            <div className="flex items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full ml-2" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/2 mb-4" />
            <div className="flex justify-between mb-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-2 w-full bg-blue-100" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-2 w-full bg-pink-100 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
