// app/t/(schools)/(navigations)/accounting/[idNumber]/receipt/route.ts

import type { SupabaseClient } from '@/lib/supabase/server'
import type { IInvoicePaymentHistory, IInvoicePaymentPlan, IInvoiceSchool, IInvoiceStudent, IPaymentInvoice } from '@/types/invoice'
import { NextResponse } from 'next/server'
import { pdfStream } from '@/components/PdfStream'
import { PAYMENT_METHOD_FROM_STRING_OPTIONS_MAP } from '@/constants'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'
import { ERole } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ idNumber: string }> },
) {
  const { idNumber } = await params
  try {
    const client = await createClient()
    const userId = await checkAuthUserId(client)
    const schoolId = await getDirectorSchoolId(client, userId)
    const [school, histories, paymentPlan, student] = await Promise.all([
      fetchSchoolData(client, schoolId),
      fetchPaymentData(client, idNumber),
      fetchPaymentPlans(client, idNumber),
      fetchStudentData(client, idNumber, schoolId),
    ])
    const invoice: IPaymentInvoice = {
      school,
      student,
      paymentPlan,
      history: histories,
    }
    const _pdfStream = await pdfStream(invoice)
    const response = new NextResponse(_pdfStream as unknown as Blob)
    response.headers.set('Content-Type', 'application/pdf')
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="invoice_${idNumber}.pdf"`,
    )
    return response
  }
  catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Invoice generation failed',
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}

async function checkAuthUserId(client: SupabaseClient): Promise<string> {
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required: No valid session found')
  }
  return user.id
}

async function getDirectorSchoolId(client: SupabaseClient, userId: string): Promise<string> {
  const { data, error } = await client
    .from('users')
    .select(`
      school_id,
      user_roles!inner(
        role_id
      )
    `)
    .eq('id', userId)
    .eq('user_roles.role_id', ERole.DIRECTOR)
    .single()
  if (error) {
    throw new Error(`Director authorization failed: ${error.message}`)
  }
  if (!data?.school_id) {
    throw new Error('Director account not associated with any school')
  }
  return data.school_id
}

async function fetchPaymentPlans(client: SupabaseClient, studentIdNumber: string): Promise<IInvoicePaymentPlan> {
  const { data: installments, error: installmentsError } = await client
    .from('payment_view')
    .select('enrollment_id')
    .eq('student_id_number', studentIdNumber)
    .limit(1)
  if (installmentsError || !installments.length) {
    throw new Error(`Payment data fetch failed: ${installmentsError?.message}`)
  }
  const { data, error } = await client
    .from('payment_plans')
    .select('total_amount, amount_paid')
    .eq('enrollment_id', installments[0].enrollment_id!)
    .single()
  if (error) {
    throw new Error(`Payment data fetch failed: ${error.message}`)
  }
  return {
    totalAmount: data.total_amount,
    amountPaid: data.amount_paid,
  } satisfies IInvoicePaymentPlan
}

async function fetchPaymentData(client: SupabaseClient, studentIdNumber: string): Promise<IInvoicePaymentHistory[]> {
  const { data: installments, error: installmentsError } = await client
    .from('payment_view')
    .select('payment_installment_id')
    .eq('student_id_number', studentIdNumber)
  if (installmentsError) {
    throw new Error(`Payment data fetch failed: ${installmentsError.message}`)
  }
  const { data, error } = await client
    .from('payments')
    .select('amount, paid_at, payment_method, reference')
    .in('installment_id', installments.map(installment => installment.payment_installment_id!))
  if (error) {
    throw new Error(`Payment data fetch failed: ${error.message}`)
  }
  return data.map(p => ({
    amount: p.amount,
    paidAt: p.paid_at!,
    reference: p.reference,
    method: PAYMENT_METHOD_FROM_STRING_OPTIONS_MAP[p.payment_method],
  } satisfies IInvoicePaymentHistory))
}

async function fetchSchoolData(client: SupabaseClient, schoolId: string): Promise<IInvoiceSchool> {
  const { data, error } = await client
    .from('schools')
    .select('name, code, image_url')
    .eq('id', schoolId)
    .single()
  if (error) {
    throw new Error(`School data fetch failed: ${error.message}`)
  }
  return {
    name: data.name,
    code: data.code,
    image: data.image_url!,
  }
}

async function fetchStudentData(
  client: SupabaseClient,
  idNumber: string,
  schoolId: string,
): Promise<IInvoiceStudent> {
  const { data, error } = await client
    .from('students')
    .select(`
      id_number,
      first_name,
      last_name,
      parent:users(first_name, last_name, phone, email),
      student_school_class!inner(school_id)
    `)
    .eq('id_number', idNumber)
    .eq('student_school_class.school_id', schoolId)
    .single()
  if (error) {
    throw new Error(`Student data fetch failed: ${error.message}`)
  }
  return {
    idNumber: data.id_number,
    fullName: formatFullName(data.first_name, data.last_name),
    parentName: formatFullName(data.parent.first_name, data.parent.last_name, data.parent.email),
    parentPhoneNumber: data.parent.phone!,
  }
}
