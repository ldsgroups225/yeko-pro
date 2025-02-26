// app/t/(schools)/(navigations)/teachers/_components/TeachersTableSkeleton.tsx

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function TeachersTableSkeleton() {
  const headers = ['Enseignant', 'Email', 'Enseigne dans', 'Prof principal de', 'Actions']
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map((_, i) => (
          <TableRow key={i}>
            {headers.map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
