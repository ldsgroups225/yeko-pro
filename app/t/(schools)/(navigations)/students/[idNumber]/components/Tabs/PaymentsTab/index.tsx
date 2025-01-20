'use client'

import type { Student } from '../../../types'
import type { FeeCategory } from './FeesBreakdown'
import type { PaymentRecord } from './PaymentHistory'
import type { PaymentStatusItem } from './PaymentStatus'
import { Card } from '@/components/ui/card'
import { FeesBreakdown } from './FeesBreakdown'
import { PaymentHistory } from './PaymentHistory'
import { PaymentStatus } from './PaymentStatus'

interface PaymentsTabProps {
  student: Student
  isLoading?: boolean
}

// Mock data - Replace with API calls later
const mockPaymentStatus: PaymentStatusItem[] = [
  {
    id: 'tuition',
    category: 'Frais de Scolarité',
    amount: 500000,
    status: 'paid',
  },
  {
    id: 'transport',
    category: 'Transport',
    amount: 150000,
    status: 'pending',
    dueDate: '31/01/2025',
  },
  {
    id: 'cafeteria',
    category: 'Cantine',
    amount: 75000,
    status: 'paid',
  },
]

const mockPaymentHistory: PaymentRecord[] = [
  {
    id: 'pay1',
    date: '05/01/2025',
    category: 'Frais de Scolarité - T2',
    amount: 500000,
    method: 'bank_transfer',
    reference: 'VIR-2025-001',
  },
  {
    id: 'pay2',
    date: '05/01/2025',
    category: 'Cantine - T2',
    amount: 75000,
    method: 'mobile_money',
    reference: 'MM-2025-001',
  },
]

const mockFees: FeeCategory[] = [
  {
    id: 'tuition',
    name: 'Frais de Scolarité',
    totalAmount: 1500000,
    paidAmount: 1000000,
    dueDate: '31/03/2025',
    description: 'Frais annuels incluant les fournitures',
    isOptional: false,
  },
  {
    id: 'transport',
    name: 'Transport Scolaire',
    totalAmount: 450000,
    paidAmount: 300000,
    dueDate: '31/01/2025',
    isOptional: true,
  },
  {
    id: 'cafeteria',
    name: 'Cantine',
    totalAmount: 225000,
    paidAmount: 150000,
    dueDate: '31/01/2025',
    description: 'Repas du midi (3 trimestres)',
    isOptional: true,
  },
]

export function PaymentsTab({ student: _student, isLoading }: PaymentsTabProps) {
  // TODO: Replace mock data with actual API calls using student data
  // Example: useEffect(() => { fetchPaymentData(student.id) }, [student.id])

  return (
    <Card>
      <div className="space-y-6">
        <PaymentStatus
          payments={mockPaymentStatus}
          isLoading={isLoading}
        />

        <div className="grid grid-cols-1 gap-6">
          <FeesBreakdown
            fees={mockFees}
            isLoading={isLoading}
          />
          <PaymentHistory
            payments={mockPaymentHistory}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Card>
  )
}

export { FeesBreakdown } from './FeesBreakdown'
export type { FeeCategory } from './FeesBreakdown'
export { PaymentHistory } from './PaymentHistory'
export type { PaymentRecord } from './PaymentHistory'
// Re-export sub-components and types for direct access
export { PaymentStatus } from './PaymentStatus'
export type { PaymentStatusItem } from './PaymentStatus'
