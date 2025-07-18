// services/paymentService.ts

'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import type { StudentForPayment } from '@/types/accounting'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'

interface Transaction {
  id: string
  studentName: string
  matriculation: string
  paymentDate: Date
  amount: number
}

interface GetPaymentHistoryParams {
  searchTerm?: string
  startDate?: string
  endDate?: string
}

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
  const userId = await checkAuthUserId(client)
  await getDirectorSchoolId(client, userId)

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

export async function getPaymentHistory(params: GetPaymentHistoryParams = {}): Promise<Transaction[]> {
  const client = await createClient()

  // Verify the authenticated director and retrieve their school
  const userId = await checkAuthUserId(client)
  const schoolId = await getDirectorSchoolId(client, userId)

  let query = client.from('payment_details_view')
    .select(`
      first_name, last_name, id_number,
      payment_date, payment_amount
    `)
    .eq('school_id', schoolId)

  if (params.searchTerm) {
    const searchTerm = `%${params.searchTerm}%`
    query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},id_number.ilike.${searchTerm}`)
  }

  if (params.startDate) {
    query = query.gte('payment_date', params.startDate)
  }

  if (params.endDate) {
    const to = new Date(params.endDate)
    to.setHours(23, 59, 59, 999) // Include the entire end day
    query = query.lte('payment_date', to.toISOString())
  }

  const { data, error } = await query.order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching payment history:', error)
    throw new Error('Erreur lors de la récupération de l\'historique des paiements')
  }

  return data.map(payment => ({
    id: nanoid(),
    studentName: formatFullName(payment.first_name, payment.last_name),
    matriculation: payment.id_number!,
    paymentDate: new Date(payment.payment_date!),
    amount: payment.payment_amount!,
  } satisfies Transaction))
}

export async function getStudentPaymentDetailsByMatriculation(
  matriculation: string,
): Promise<StudentForPayment> {
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
    throw new Error('Erreur : impossible de récupérer l’année scolaire en cours.')
  }

  if (studentRes.error || !student) {
    throw new Error('Erreur : étudiant introuvable avec cette matricule.')
  }

  // Étape 2 : Paralléliser récupération du statut de paiement et de l’inscription active
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
    throw new Error('Erreur : échec de récupération des données d’inscription.')
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
}
