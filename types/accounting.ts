import type { ReactNode } from 'react'

export interface FinancialStatistic {
  title: string
  value: string | number
  description: string
  icon: ReactNode | string
}

export interface FinancialMetrics {
  revenue: {
    total: number
    previousMonthPercentage: number
  }
  unpaidAmount: {
    total: number
    studentCount: number
  }
  recoveryRate: {
    percentage: number
    previousMonthPercentage: number
  }
  upToDatePayments: {
    studentCount: number
  }
  latePayments: {
    studentCount: number
  }
}

export interface RevenueVsCostData {
  month: string
  revenue: number
  cost: number
}

export interface CollectionRateData {
  month: string
  rate: number
  amount_collected: number
  total_expected: number
}

export interface MonthlyFinancialMetrics {
  revenue: {
    total: number
    previousMonth: number
    percentageChange: number
  }
  collections: {
    expected: number
    received: number
    rate: number
  }
}

export interface StudentWithPaymentStatus {
  id: string
  name: string
  idNumber: string
  classroom: string
  paymentStatus: 'paid' | 'overdue'
  remainingAmount: number
}
