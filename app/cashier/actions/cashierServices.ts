// app/cashier/_data/cashierServices.ts

'use server'

import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { getAuthenticatedCashierUser } from './auth'

export interface StudentSearchResult {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl?: string
  className?: string
  gradeName?: string
  balance: number
  totalDue: number
  totalPaid: number
  lastPaymentDate?: Date
  paymentStatus: 'up_to_date' | 'overdue' | 'partial'
}

export interface PaymentTransaction {
  id: string
  studentId: string
  studentName: string
  studentIdNumber: string
  className?: string
  amount: number
  paymentMethod: string
  reference?: string
  paidAt: Date
  processedBy: string
}

export interface DashboardStats {
  todayCollection: number
  todayTransactionCount: number
  weeklyCollection: number
  monthlyCollection: number
  overdueStudents: number
  totalActiveStudents: number
}

export interface EndOfDayReport {
  date: Date
  totalCollection: number
  transactionCount: number
  paymentMethodBreakdown: {
    method: string
    count: number
    amount: number
  }[]
  transactions: PaymentTransaction[]
  cashierName: string
}

export interface StudentForPayment {
  id: string
  photo?: string
  fullName: string
  matriculation: string
  financialInfo: {
    totalTuition: number
    remainingBalance: number
    installmentAmount: number
    lastPayment?: {
      date: Date
      amount: number
      method: string
    } | null
  }
}

/**
 * Search for students by name or ID number
 * Cached for request deduplication
 */
export const searchStudents = cache(async (searchTerm: string, limit: number = 10): Promise<StudentSearchResult[]> => {
  const cashierUser = await getAuthenticatedCashierUser()
  const supabase = await createClient()

  // Get current school year for filtering
  const { data: currentSchoolYear } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentSchoolYear) {
    throw new Error('No current school year found')
  }

  const { data: students, error } = await supabase
    .from('student_payment_status_view')
    .select(`
      student_id,
      first_name,
      last_name,
      id_number,
      classroom,
      is_up_to_date,
      overdue_amount,
      remaining_amount,
      last_payment_amount,
      last_payment_date
    `)
    .eq('school_id', cashierUser.schoolId)
    .eq('school_year_id', currentSchoolYear.id)
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
    .limit(limit)

  if (error) {
    console.error('Error searching students:', error)
    throw new Error('Failed to search students')
  }

  return students.map(student => ({
    id: student.student_id || '',
    idNumber: student.id_number || '',
    firstName: student.first_name || '',
    lastName: student.last_name || '',
    fullName: formatFullName(student.first_name || '', student.last_name || ''),
    avatarUrl: undefined, // Not available in this view
    className: student.classroom || undefined,
    gradeName: undefined, // Not available in this view
    balance: student.overdue_amount || 0,
    totalDue: student.remaining_amount || 0,
    totalPaid: student.last_payment_amount || 0,
    lastPaymentDate: student.last_payment_date ? new Date(student.last_payment_date) : undefined,
    paymentStatus: student.is_up_to_date
      ? 'up_to_date'
      : (student.overdue_amount && student.overdue_amount > 0 ? 'overdue' : 'partial'),
  }))
})

/**
 * Get student by matriculation for payment processing with optimized parallel queries
 */
export const getStudentByMatriculation = cache(async (matriculation: string): Promise<StudentForPayment> => {
  const client = await createClient()

  // Étape 1 : Paralléliser la récupération de l'année scolaire et de l'étudiant
  const [schoolYearRes, studentRes] = await Promise.all([
    client.from('school_years').select('id').eq('is_current', true).single(),
    client
      .from('students')
      .select('id, first_name, last_name, avatar_url')
      .eq('id_number', matriculation)
      .single(),
  ])

  const currentSchoolYear = schoolYearRes.data
  const student = studentRes.data

  if (schoolYearRes.error || !currentSchoolYear) {
    throw new Error('Erreur : impossible de récupérer l\'année scolaire en cours.')
  }

  if (studentRes.error || !student) {
    throw new Error('Erreur : étudiant introuvable avec cette matricule.')
  }

  // Étape 2 : Paralléliser récupération du statut de paiement et de l'inscription active
  const [paymentStatusRes, enrollmentRes] = await Promise.all([
    client
      .from('student_payment_status_view')
      .select('is_up_to_date, overdue_amount')
      .eq('student_id', student.id)
      .eq('school_year_id', currentSchoolYear.id),
    client
      .from('student_school_class')
      .select('id')
      .eq('student_id', student.id)
      .eq('school_year_id', currentSchoolYear.id)
      .eq('enrollment_status', 'accepted')
      .is('is_active', true)
      .single(),
  ])

  const paymentStatus = paymentStatusRes.data
  const enrollment = enrollmentRes.data

  if (paymentStatusRes.error) {
    throw new Error('Erreur : échec de récupération du statut de paiement.')
  }

  if (!paymentStatus || paymentStatus.length === 0) {
    throw new Error('Cet élève est à jour.')
  }

  if (enrollmentRes.error || !enrollment) {
    throw new Error('Erreur : échec de récupération des données d\'inscription.')
  }

  // Étape 3 : Paralléliser le dernier paiement et le plan de paiement
  const [lastPaymentRes, paymentPlanRes] = await Promise.all([
    client
      .from('payments')
      .select('amount, paid_at, payment_method')
      .eq('enrollment_id', enrollment.id)
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    client
      .from('payment_plans')
      .select(
        'total_amount, amount_paid, installments: payment_installments(id, due_date, status, amount)',
      )
      .eq('enrollment_id', enrollment.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const lastPayment = lastPaymentRes.data
  const paymentPlan = paymentPlanRes.data

  if (lastPaymentRes.error) {
    throw new Error('Erreur : échec de récupération du dernier paiement.')
  }

  if (paymentPlanRes.error || !paymentPlan) {
    throw new Error('Erreur : échec de récupération du plan de paiement.')
  }

  revalidatePath('/cashier')

  // Retour structuré
  return {
    id: student.id,
    photo: student.avatar_url ?? undefined,
    fullName: formatFullName(student.first_name, student.last_name),
    matriculation,
    financialInfo: {
      totalTuition: paymentPlan.total_amount,
      remainingBalance: paymentPlan.total_amount - paymentPlan.amount_paid,
      installmentAmount: paymentPlan.installments?.[0]?.amount ?? 0,
      lastPayment: lastPayment
        ? {
            date: new Date(lastPayment.paid_at!),
            amount: lastPayment.amount,
            method: lastPayment.payment_method,
          }
        : null,
    },
  }
})

/**
 * Get student details by ID for payment processing
 */
export const getStudentForPayment = cache(async (studentId: string): Promise<StudentSearchResult | null> => {
  const cashierUser = await getAuthenticatedCashierUser()
  const supabase = await createClient()

  // Get current school year
  const { data: currentSchoolYear } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentSchoolYear) {
    return null
  }

  const { data: student, error } = await supabase
    .from('student_payment_status_view')
    .select(`
      student_id,
      first_name,
      last_name,
      id_number,
      classroom,
      is_up_to_date,
      overdue_amount,
      remaining_amount,
      last_payment_amount,
      last_payment_date
    `)
    .eq('school_id', cashierUser.schoolId)
    .eq('school_year_id', currentSchoolYear.id)
    .eq('student_id', studentId)
    .single()

  if (error || !student) {
    return null
  }

  // Note: last payment date is already available in student_payment_status_view

  return {
    id: student.student_id || '',
    idNumber: student.id_number || '',
    firstName: student.first_name || '',
    lastName: student.last_name || '',
    fullName: formatFullName(student.first_name || '', student.last_name || ''),
    avatarUrl: undefined, // Not available in this view
    className: student.classroom || undefined,
    gradeName: undefined, // Not available in this view
    balance: student.overdue_amount || 0,
    totalDue: student.remaining_amount || 0,
    totalPaid: student.last_payment_amount || 0,
    lastPaymentDate: student.last_payment_date ? new Date(student.last_payment_date) : undefined,
    paymentStatus: student.is_up_to_date
      ? 'up_to_date'
      : (student.overdue_amount && student.overdue_amount > 0 ? 'overdue' : 'partial'),
  }
})

/**
 * Creates a payment record for a student.  This function is intended to be
 * called *only* by a logged-in user with the 'DIRECTOR' role.  It performs
 * authentication and authorization checks before creating the payment. The
 * payment processing itself is handled by the `process_payment` Supabase
 * function (RPC) to ensure atomicity.
 *
 * @async
 * @param {string} studentId - The ID of the student for whom the payment is being made.
 * @param {number} amount - The amount of the payment. Must be a positive number.
 * @param {string} paymentMethod - The payment method used (e.g., 'credit_card', 'bank_transfer', 'cash').
 * @returns {Promise<any>} A promise that resolves to the data returned by the `process_payment` RPC.
 *   The exact structure of the returned data depends on the `process_payment` function's implementation.
 *   Typically, this would include information about the created payment record.
 * @throws {Error}
 *  - If the user is not authenticated.
 *  - If the user is not a director.
 *  - If the user is not associated with a school.
 *  - If there is an error during the payment processing (handled by the `process_payment` RPC).
 * @example
 * ```typescript
 * try {
 *    const paymentData = await createPayment('student-123', 100, 'credit_card');
 *    console.log('Payment created:', paymentData);
 * } catch (error) {
 *    console.error('Payment failed:', error);
 * }
 * ```
 */
export async function createPayment(
  studentId: string,
  amount: number,
  paymentMethod: string,
): Promise<any> {
  const client = await createClient()

  // Verify the authenticated director and retrieve their school
  await getAuthenticatedCashierUser()

  // Call the Supabase function (RPC) to perform the payment transaction atomically
  const { data, error } = await client.rpc('process_payment', {
    _student_id: studentId,
    _amount: amount,
    _payment_method: paymentMethod,
  })

  if (error) {
    console.error('Payment processing error:', error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Get dashboard statistics for the cashier
 */
export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const cashierUser = await getAuthenticatedCashierUser()
  const supabase = await createClient()

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const weekStart = new Date(todayStart.getTime() - (7 * 24 * 60 * 60 * 1000))
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  // Get current school year
  const { data: currentSchoolYear } = await supabase
    .from('school_years')
    .select('id')
    .eq('is_current', true)
    .single()

  if (!currentSchoolYear) {
    throw new Error('No current school year found')
  }

  // Parallel queries for better performance
  const [
    { data: todayPayments },
    { data: weeklyPayments },
    { data: monthlyPayments },
    { data: studentCounts },
  ] = await Promise.all([
    // Today's payments
    supabase
      .from('payment_details_view')
      .select('payment_amount')
      .eq('school_id', cashierUser.schoolId)
      .gte('payment_date', todayStart.toISOString())
      .lt('payment_date', new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString()),

    // Weekly payments
    supabase
      .from('payment_details_view')
      .select('payment_amount')
      .eq('school_id', cashierUser.schoolId)
      .gte('payment_date', weekStart.toISOString()),

    // Monthly payments
    supabase
      .from('payment_details_view')
      .select('payment_amount')
      .eq('school_id', cashierUser.schoolId)
      .gte('payment_date', monthStart.toISOString()),

    // Student counts
    supabase
      .from('student_payment_status_view')
      .select('is_up_to_date')
      .eq('school_id', cashierUser.schoolId)
      .eq('school_year_id', currentSchoolYear.id),
  ])

  const todayCollection = todayPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0
  const weeklyCollection = weeklyPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0
  const monthlyCollection = monthlyPayments?.reduce((sum, p) => sum + (p.payment_amount || 0), 0) || 0

  const totalActiveStudents = studentCounts?.length || 0
  const overdueStudents = studentCounts?.filter(s => !s.is_up_to_date).length || 0

  return {
    todayCollection,
    todayTransactionCount: todayPayments?.length || 0,
    weeklyCollection,
    monthlyCollection,
    overdueStudents,
    totalActiveStudents,
  }
})

/**
 * Get recent payment transactions
 */
export const getRecentTransactions = cache(async (limit: number = 10): Promise<PaymentTransaction[]> => {
  const cashierUser = await getAuthenticatedCashierUser()
  const supabase = await createClient()

  const { data: transactions, error } = await supabase
    .from('payment_details_view')
    .select(`
      student_id,
      first_name,
      last_name,
      id_number,
      class_id,
      payment_amount,
      payment_method,
      payment_date
    `)
    .eq('school_id', cashierUser.schoolId)
    .order('payment_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent transactions:', error)
    throw new Error('Failed to fetch recent transactions')
  }

  return transactions.map((tx, index) => ({
    id: `tx_${index}_${tx.student_id}`, // Generate a unique ID
    studentId: tx.student_id || '',
    studentName: formatFullName(tx.first_name || '', tx.last_name || ''),
    studentIdNumber: tx.id_number || '',
    className: undefined, // Not available in this view
    amount: tx.payment_amount || 0,
    paymentMethod: tx.payment_method || 'Unknown',
    reference: undefined, // Not available in this view
    paidAt: new Date(tx.payment_date || new Date()),
    processedBy: cashierUser.fullName,
  }))
})

/**
 * Generate end-of-day report for a specific date
 */
export const generateEndOfDayReport = cache(async (reportDate?: Date): Promise<EndOfDayReport> => {
  const cashierUser = await getAuthenticatedCashierUser()
  const supabase = await createClient()

  const date = reportDate || new Date()
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  // Get all transactions for the day
  const { data: transactions, error } = await supabase
    .from('payment_details_view')
    .select(`
      student_id,
      first_name,
      last_name,
      id_number,
      payment_amount,
      payment_method,
      payment_date
    `)
    .eq('school_id', cashierUser.schoolId)
    .gte('payment_date', dayStart.toISOString())
    .lt('payment_date', dayEnd.toISOString())
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error generating end-of-day report:', error)
    throw new Error('Failed to generate end-of-day report')
  }

  const totalCollection = transactions.reduce((sum, tx) => sum + (tx.payment_amount || 0), 0)

  // Group by payment method
  const methodBreakdown = transactions.reduce((acc, tx) => {
    const method = tx.payment_method || 'Unknown'
    const existing = acc.find(item => item.method === method)

    if (existing) {
      existing.count++
      existing.amount += tx.payment_amount || 0
    }
    else {
      acc.push({
        method,
        count: 1,
        amount: tx.payment_amount || 0,
      })
    }

    return acc
  }, [] as { method: string, count: number, amount: number }[])

  const transactionList: PaymentTransaction[] = transactions.map((tx, index) => ({
    id: `report_tx_${index}_${tx.student_id}`,
    studentId: tx.student_id || '',
    studentName: formatFullName(tx.first_name || '', tx.last_name || ''),
    studentIdNumber: tx.id_number || '',
    className: undefined, // Not available in this view
    amount: tx.payment_amount || 0,
    paymentMethod: tx.payment_method || 'Unknown',
    reference: undefined, // Not available in this view
    paidAt: new Date(tx.payment_date || new Date()),
    processedBy: cashierUser.fullName,
  }))

  return {
    date,
    totalCollection,
    transactionCount: transactions.length,
    paymentMethodBreakdown: methodBreakdown,
    transactions: transactionList,
    cashierName: cashierUser.fullName,
  }
})
