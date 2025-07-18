import { nanoid } from 'nanoid'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ProgressReportTableSkeleton() {
  const headersCount = 9 // Number of columns
  const rowsCount = 5

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: headersCount }).map(() => (
                <TableHead key={nanoid()}><Skeleton className="h-4 w-20" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowsCount }).map(() => (
              <TableRow key={nanoid()}>
                {Array.from({ length: headersCount }).map(() => (
                  <TableCell key={nanoid()}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Skeleton for Pagination */}
      <div className="flex justify-between items-center mt-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}
