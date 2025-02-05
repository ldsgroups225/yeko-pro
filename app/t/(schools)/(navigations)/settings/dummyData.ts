export interface Grade {
  id: number
  name: string
  description: string
}

export interface PaymentPlan {
  id: string
  enrollmentId: string
  studentName: string
  totalAmount: number
  amountPaid: number
  createdAt: string
  updatedAt: string
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue'
}

export interface TuitionSettings {
  id: string
  schoolId: string
  gradeId: number
  annualFee: number
  governmentDiscountPercentage: number
  createdAt: string
  updatedAt: string
}

export const dummyGrades: Grade[] = [
  { id: 1, name: 'CP', description: 'Cours Préparatoire' },
  { id: 2, name: 'CE1', description: 'Cours Élémentaire 1ère année' },
  { id: 3, name: 'CE2', description: 'Cours Élémentaire 2ème année' },
  { id: 4, name: 'CM1', description: 'Cours Moyen 1ère année' },
  { id: 5, name: 'CM2', description: 'Cours Moyen 2ème année' },
]

export const dummyTuitionSettings: { [gradeId: number]: TuitionSettings } = {
  1: {
    id: 'ts-1',
    schoolId: 'school-1',
    gradeId: 1,
    annualFee: 75000,
    governmentDiscountPercentage: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  2: {
    id: 'ts-2',
    schoolId: 'school-1',
    gradeId: 2,
    annualFee: 80000,
    governmentDiscountPercentage: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  3: {
    id: 'ts-3',
    schoolId: 'school-1',
    gradeId: 3,
    annualFee: 85000,
    governmentDiscountPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  4: {
    id: 'ts-4',
    schoolId: 'school-1',
    gradeId: 4,
    annualFee: 90000,
    governmentDiscountPercentage: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  5: {
    id: 'ts-5',
    schoolId: 'school-1',
    gradeId: 5,
    annualFee: 95000,
    governmentDiscountPercentage: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

export function generateDummyPaymentPlans(gradeId: number): PaymentPlan[] {
  const count = Math.floor(Math.random() * 5) + 3 // 3 to 7 plans
  return Array.from({ length: count }, (_, i) => {
    const totalAmount = Math.floor(Math.random() * 100000) + 50000
    const amountPaid = Math.floor(Math.random() * totalAmount)
    const statuses: PaymentPlan['paymentStatus'][] = ['pending', 'partial', 'paid', 'overdue']
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    return {
      id: `pp-${gradeId}-${i + 1}`,
      enrollmentId: `enroll-${gradeId}-${i + 1}`,
      studentName: `Student ${i + 1} - Grade ${gradeId}`,
      totalAmount,
      amountPaid,
      paymentStatus: status,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  })
}
