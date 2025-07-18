import { nanoid } from 'nanoid'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function StudentPaymentsListSkeleton() {
  return (
    <div className="mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map(() => (
            <TableRow key={nanoid()}>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
