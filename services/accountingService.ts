'use server'

import type { CollectionRateData, FinancialMetrics, RevenueVsCostData } from '@/types/accounting'
import { createClient } from '@/lib/supabase/server'

export async function getFinancialMetrics(schoolId: string): Promise<FinancialMetrics> {
  const supabase = await createClient()
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  // 1. Get current month revenue and previous month for comparison
  const { data: currentMonthPayments } = await supabase
    .from('payment_details_view')
    .select('payment_amount')
    .eq('school_id', schoolId)
    .gte('payment_date', firstDayOfMonth.toISOString())
    .lt('payment_date', today.toISOString())

  const { data: previousMonthPayments } = await supabase
    .from('payment_details_view')
    .select('payment_amount')
    .eq('school_id', schoolId)
    .gte('payment_date', firstDayOfPreviousMonth.toISOString())
    .lt('payment_date', firstDayOfMonth.toISOString())

  // 2. Get unpaid amounts and student count
  const { data: unpaidDetails } = await supabase
    .from('payment_details_view')
    .select('student_id, remaining_amount')
    .eq('school_id', schoolId)
    .gt('remaining_amount', 0)

  // 3. Get payment plans for recovery rate
  const { data: paymentPlans } = await supabase
    .from('payment_plans')
    .select(`
      total_amount,
      amount_paid,
      enrollment_id,
      student_school_class!inner(school_id)
    `)
    .eq('student_school_class.school_id', schoolId)

  // 4. Get up-to-date and late payments counts
  const { data: installments } = await supabase
    .from('payment_installments')
    .select(`
      id,
      status,
      due_date,
      payment_plan_id,
      payment_plans!inner(
        enrollment_id,
        student_school_class!inner(school_id)
      )
    `)
    .eq('payment_plans.student_school_class.school_id', schoolId)

  // Calculate metrics
  const currentMonthRevenue = currentMonthPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0
  const previousMonthRevenue = previousMonthPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0
  const revenuePercentageChange = previousMonthRevenue ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

  const unpaidTotal = unpaidDetails?.reduce((sum, p) => sum + (p.remaining_amount || 0), 0) || 0
  const unpaidStudentCount = new Set(unpaidDetails?.map(p => p.student_id)).size

  const totalExpectedAmount = paymentPlans?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0
  const totalPaidAmount = paymentPlans?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0
  const recoveryRate = totalExpectedAmount ? (totalPaidAmount / totalExpectedAmount) * 100 : 0

  const upToDateCount = new Set(
    installments
      ?.filter(i => i.status === 'paid' || new Date(i.due_date) > new Date())
      .map(i => i.payment_plan_id),
  ).size

  const lateCount = new Set(
    installments
      ?.filter(i => i.status !== 'paid' && new Date(i.due_date) <= new Date())
      .map(i => i.payment_plan_id),
  ).size

  return {
    revenue: {
      total: currentMonthRevenue,
      previousMonthPercentage: revenuePercentageChange,
    },
    unpaidAmount: {
      total: unpaidTotal,
      studentCount: unpaidStudentCount,
    },
    recoveryRate: {
      percentage: recoveryRate,
      previousMonthPercentage: 0, // TODO: Calculate previous month's recovery rate
    },
    upToDatePayments: {
      studentCount: upToDateCount,
    },
    latePayments: {
      studentCount: lateCount,
    },
  }
}

export async function getRevenueVsCostData(
  schoolId: string,
  startDate: Date,
  endDate: Date,
): Promise<RevenueVsCostData[]> {
  const supabase = await createClient()

  // Get revenue from payments
  const { data: payments } = await supabase
    .from('payment_details_view')
    .select('payment_amount, payment_date')
    .eq('school_id', schoolId)
    .gte('payment_date', startDate.toISOString())
    .lte('payment_date', endDate.toISOString())
    .order('payment_date', { ascending: true })

  // Group payments by month
  const monthlyData = new Map<string, RevenueVsCostData>()

  payments?.forEach((payment) => {
    const date = new Date(payment.payment_date!)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1)
      .toLocaleDateString('fr-FR', { month: 'short' })

    const existing = monthlyData.get(monthKey) || {
      month: monthLabel,
      revenue: 0,
      cost: 0, // We'll calculate costs in a future iteration
    }

    existing.revenue += payment.payment_amount || 0
    monthlyData.set(monthKey, existing)
  })

  return Array.from(monthlyData.values())
}

export async function getCollectionRateData(
  schoolId: string,
  startDate: Date,
  endDate: Date,
): Promise<CollectionRateData[]> {
  const supabase = await createClient()

  // Get all payment plans and their installments
  const { data: paymentPlans } = await supabase
    .from('payment_plans')
    .select(`
      id,
      total_amount,
      amount_paid,
      payment_installments (
        amount,
        due_date,
        status
      ),
      student_school_class!inner (
        school_id
      )
    `)
    .eq('student_school_class.school_id', schoolId)

  // Group by month and calculate collection rates
  const monthlyData = new Map<string, CollectionRateData>()

  paymentPlans?.forEach((plan) => {
    plan.payment_installments?.forEach((installment: any) => {
      const date = new Date(installment.due_date)
      if (date < startDate || date > endDate)
        return

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1)
        .toLocaleDateString('fr-FR', { month: 'short' })

      const existing = monthlyData.get(monthKey) || {
        month: monthLabel,
        rate: 0,
        amount_collected: 0,
        total_expected: 0,
      }

      existing.total_expected += installment.amount
      if (installment.status === 'paid') {
        existing.amount_collected += installment.amount
      }

      existing.rate = (existing.amount_collected / existing.total_expected) * 100
      monthlyData.set(monthKey, existing)
    })
  })

  return Array.from(monthlyData.values())
}
