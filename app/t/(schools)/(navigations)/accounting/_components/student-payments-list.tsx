import { getStudentsWithPaymentStatus } from '@/services/accountingService'
import { StudentPaymentsTable } from './student-payments-table'

interface StudentPaymentsListProps {
  status?: 'paid' | 'overdue'
  searchTerm?: string
}

export async function StudentPaymentsList({ status, searchTerm }: StudentPaymentsListProps) {
  const students = await getStudentsWithPaymentStatus({ status, searchTerm })

  return <StudentPaymentsTable students={students} />
}
