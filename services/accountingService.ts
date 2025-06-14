// services/accountingService.ts

'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { CollectionRateData, FinancialMetrics, RevenueVsCostData, StudentWithPaymentStatus } from '@/types/accounting'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'

/**
 * Retrieves the authenticated user's ID using the provided Supabase client.
 * This function verifies user authentication and is used as a prerequisite for other operations.
 *
 * @async
 * @param {SupabaseClient} client - The Supabase client instance configured for server-side operations.
 * @returns {Promise<string>} A promise that resolves to the authenticated user's ID.
 * @throws {Error} Will throw an error if fetching the user fails, indicating an authentication issue.
 */
async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: user, error } = await client.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error)
    throw new Error('Vous n\'êtes pas autorisé à accéder à cette page')
  }
  return user.user.id
}

/**
 * Retrieves the school ID associated with the director user.
 * This function assumes the user is a director and fetches their associated school ID from the database.
 * It also verifies that the user has the DIRECTOR role.
 *
 * @async
 * @param {SupabaseClient} client - The Supabase client instance configured for server-side operations.
 * @param {string} userId - The authenticated user's ID.
 * @returns {Promise<string>} A promise that resolves to the director's school ID.
 * @throws {Error}
 *  - Will throw an error if the user is not a director.
 *  - Will throw an error if there is an issue fetching the school ID from the database.
 *  - Will throw an error if the user is not associated with any school.
 */
async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data: userSchool, error } = await client
    .from('users')
    .select('school_id, user_roles(role_id)')
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()
  if (error || !userSchool?.school_id) {
    console.error('Error fetching user school:', error)
    throw new Error('Seul un directeur peut accéder à cette page')
  }
  return userSchool.school_id
}

export async function getFinancialMetrics(): Promise<FinancialMetrics> {
  const supabase = await createClient()
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  // Get current school year
  const { data: currentSchoolYear, error: schoolYearError } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (schoolYearError || !currentSchoolYear) {
    throw new Error('Could not determine the current school year.')
  }
  const schoolYearId = currentSchoolYear.id

  // 1. Get current month revenue and previous month for comparison from payment_details_view
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

  // Calculate monthly revenue for description
  const currentMonthRevenue = currentMonthPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0
  const previousMonthRevenue = previousMonthPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0
  const revenuePercentageChange = previousMonthRevenue > 0 ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0

  // --- New calculations based on student_financial_summary_view ---
  const { data: financialSummaries, error: summaryError } = await supabase
    .from('student_financial_summary_view')
    .select('*')
    .eq('school_id', schoolId)
    .eq('school_year_id', schoolYearId)

  if (summaryError) {
    console.error('Error fetching financial summaries:', summaryError)
    throw new Error('Failed to fetch financial summary data.')
  }

  // Calculate metrics from the summary view
  const expectedAnnualRevenue = financialSummaries?.reduce((sum, s) => sum + (s.total_tuition || 0), 0) ?? 0
  const unpaidTotal = financialSummaries?.reduce((sum, s) => sum + (s.overdue_amount || 0), 0) ?? 0
  const unpaidStudentCount = financialSummaries?.filter(s => s.overdue_amount && s.overdue_amount > 0).length ?? 0

  const totalDueToDate = financialSummaries?.reduce((sum, s) => sum + (s.total_due_to_date || 0), 0) ?? 0
  const paidForDueInstallments = financialSummaries?.reduce((sum, s) => sum + (s.paid_for_due_installments || 0), 0) ?? 0
  const recoveryRate = totalDueToDate > 0 ? (paidForDueInstallments / totalDueToDate) * 100 : 0

  const upToDateCount = financialSummaries?.filter(s => s.is_up_to_date).length ?? 0
  const lateCount = (financialSummaries?.length ?? 0) - upToDateCount

  return {
    revenue: {
      total: expectedAnnualRevenue, // This is now the expected annual revenue
      previousMonthPercentage: revenuePercentageChange, // This is the change in actual monthly revenue
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

  const { data: payments, error } = await supabase
    .from('payment_details_view')
    .select('payment_amount, payment_date')
    .eq('school_id', schoolId)
    .gte('payment_date', startDate.toISOString())
    .lte('payment_date', endDate.toISOString())
    .order('payment_date', { ascending: true })

  if (error) {
    console.error('Error fetching revenue data for chart:', error)
    throw new Error('Failed to fetch revenue data.')
  }

  const monthlyData = new Map<string, RevenueVsCostData>()

  payments?.forEach((payment) => {
    if (!payment.payment_date)
      return
    const date = new Date(payment.payment_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('fr-FR', { month: 'short' })

    const existing = monthlyData.get(monthKey) || { month: monthLabel, revenue: 0, cost: 0 }
    existing.revenue += payment.payment_amount || 0
    monthlyData.set(monthKey, existing)
  })

  const sortedKeys = Array.from(monthlyData.keys()).sort()
  return sortedKeys.map(key => monthlyData.get(key)!)
}

export async function getCollectionRateData(
  schoolId: string,
  startDate: Date,
  endDate: Date,
): Promise<CollectionRateData[]> {
  const supabase = await createClient()

  const { data: installments, error } = await supabase
    .from('payment_installments')
    .select(`
      amount,
      due_date,
      status,
      payment_plans!inner(
        student_school_class!inner(
          school_id
        )
      )
    `)
    .eq('payment_plans.student_school_class.school_id', schoolId)
    .gte('due_date', startDate.toISOString())
    .lte('due_date', endDate.toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching collection rate data:', error)
    throw new Error('Failed to fetch collection rate data.')
  }

  const monthlyData = new Map<string, CollectionRateData>()

  installments?.forEach((installment) => {
    const date = new Date(installment.due_date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthLabel = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('fr-FR', { month: 'short' })

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
    monthlyData.set(monthKey, existing)
  })

  const sortedKeys = Array.from(monthlyData.keys()).sort()
  const sortedResult = sortedKeys.map((key) => {
    const value = monthlyData.get(key)!
    const rate = value.total_expected > 0 ? (value.amount_collected / value.total_expected) * 100 : 0
    return { ...value, rate }
  })

  return sortedResult
}

export async function getStudentsWithPaymentStatus(
  filters: { status?: 'paid' | 'overdue', searchTerm?: string },
): Promise<StudentWithPaymentStatus[]> {
  const supabase = await createClient()

  const userId = await checkAuthUserId(supabase)
  const schoolId = await getDirectorSchoolId(supabase, userId)

  const { data: currentSchoolYear, error: schoolYearError } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (schoolYearError || !currentSchoolYear) {
    throw new Error('Could not determine the current school year.')
  }

  let query = supabase
    .from('student_payment_status_view')
    .select('*')
    .eq('school_id', schoolId)
    .eq('school_year_id', currentSchoolYear.id)

  if (filters.status) {
    query = query.eq('is_up_to_date', filters.status === 'paid')
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase()
    query = query.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,id_number.ilike.%${term}%`)
  }

  const { data, error } = await query.limit(5)

  if (error) {
    console.error('Error fetching students with payment status:', error)
    throw new Error('Failed to fetch student payment statuses.')
  }

  return (
    data?.map(student => ({
      id: student.student_id!,
      name: formatFullName(student.first_name, student.last_name),
      idNumber: student.id_number!,
      classroom: student.classroom || '-',
      paymentStatus: student.is_up_to_date ? 'paid' : 'overdue',
      remainingAmount: student.remaining_amount || 0,
    })) || []
  )
}
