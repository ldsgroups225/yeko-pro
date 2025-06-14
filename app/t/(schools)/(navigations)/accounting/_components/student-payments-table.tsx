import type { StudentWithPaymentStatus } from '@/types/accounting'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'

interface StudentPaymentsTableProps {
  students: StudentWithPaymentStatus[]
}

export function StudentPaymentsTable({ students }: StudentPaymentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-left">Nom</TableHead>
          <TableHead className="text-center">Matricule</TableHead>
          <TableHead className="text-center">Classe</TableHead>
          <TableHead className="text-end">Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.length > 0
          ? (
              students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="text-left">{student.name}</TableCell>
                  <TableCell className="text-center">{student.idNumber}</TableCell>
                  <TableCell className="text-center">{student.classroom}</TableCell>
                  <TableCell className="text-end">
                    <Badge
                      variant={student.paymentStatus === 'paid' ? 'success' : 'outline'}
                      className={student.paymentStatus !== 'paid' ? 'text-white bg-red-500 border-red-500' : ''}
                    >
                      {student.paymentStatus === 'paid' ? 'A jour' : `-${formatCurrency(student.remainingAmount, true)}`}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )
          : (<TableRow><TableCell colSpan={4} className="h-24 text-center">Aucun élève trouvé.</TableCell></TableRow>)}
      </TableBody>
    </Table>
  )
}
