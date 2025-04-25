'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { nanoid } from 'nanoid'

export function NotesTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[200px]" />

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">
                  <Skeleton className="h-4 w-[100px]" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                {Array.from({ length: 5 }).map(() => (
                  <TableHead key={nanoid()}>
                    <Skeleton className="h-4 w-8" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map(() => (
                <TableRow key={nanoid()}>
                  <TableCell className="sticky left-0 bg-background">
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  {Array.from({ length: 5 }).map(() => (
                    <TableCell key={nanoid()}>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
