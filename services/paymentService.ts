// services/paymentService.ts
'use server'

import type { SupabaseClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
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

/**
 * Creates a payment transaction for a student.
 * This function creates a payment transaction in the database using the Supabase RPC function 'process_payment'.
 * The function atomically processes the payment, ensuring the student's tuition is paid and the payment record is created.
 *
 * @async
 * @param {string} studentId - The ID of the student whose tuition is being paid.
 * @param {number} amount - The amount of the payment.
 * @param {string} paymentMethod - The method of payment (e.g., 'card', 'cash', 'cheque', 'transfer').
 * @returns {Promise<any>} A promise that resolves to the result of the Supabase RPC function 'process_payment'.
 * @throws {Error} Will throw an error if the payment fails.
 */
export async function createPayment(
  studentId: string,
  amount: number,
  paymentMethod: string,
) {
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
