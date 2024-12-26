import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export function ClassTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 p-4 border-b">
          {[...Array.from({ length: 4 })].map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>

        {/* Table Rows */}
        {[...Array.from({ length: 5 })].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          {[...Array.from({ length: 3 })].map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
