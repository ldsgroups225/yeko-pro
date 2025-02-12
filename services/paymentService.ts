// services/paymentService.ts
'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'
import { nanoid } from 'nanoid'

interface Transaction {
  id: string
  studentName: string
  matriculation: string
  paymentDate: Date
  amount: number
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
  const client = createClient()

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

export async function getPaymentHistory(): Promise<any> {
  const client = createClient()

  // Verify the authenticated director and retrieve their school
  const userId = await checkAuthUserId(client)
  const schoolId = await getDirectorSchoolId(client, userId)

  const { data, error } = await client.from('payment_details_view')
    .select(`
      first_name, last_name, id_number,
      payment_date, payment_amount
    `)
    .eq('school_id', schoolId)
    .order('payment_date', { ascending: false })

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
