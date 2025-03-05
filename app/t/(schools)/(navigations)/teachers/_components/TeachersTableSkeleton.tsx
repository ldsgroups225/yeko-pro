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
          {headers.map(idx => (
            <TableHead key={idx}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 3 }).map(idx => (
          <TableRow key={JSON.stringify(idx)}>
            {headers.map(idx => (
              <TableCell key={idx}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
