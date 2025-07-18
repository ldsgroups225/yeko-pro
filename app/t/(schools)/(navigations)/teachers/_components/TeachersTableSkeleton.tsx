// app/t/(schools)/(navigations)/teachers/_components/TeachersTableSkeleton.tsx

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

export function TeachersTableSkeleton() {
  const headers = ['Enseignant', 'Email', 'Enseigne dans', 'Prof principal de', 'Actions']
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map(() => (
            <TableHead key={nanoid()}>
              <Skeleton className="h-4 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 10 }).map(() => (
          <TableRow key={nanoid()}>
            {headers.map(() => (
              <TableCell key={nanoid()}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
