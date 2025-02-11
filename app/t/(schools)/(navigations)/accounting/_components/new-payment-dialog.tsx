'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { formatFullName } from '@/lib/utils'
import { createPayment } from '@/services/paymentService'
import { useTransactionsStore } from '@/store'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PaymentForm } from './payment-form'
import { StudentInformation } from './student-information'

interface Student {
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
    }
  }
}

async function getStudent(matriculation: string): Promise<Student> {
  const client = createClient()

  // Fetch the student record and verify it is linked to a parent
  const { data: student, error: studentError } = await client
    .from('students')
    .select('id, first_name, last_name, avatar_url, parent: users(id)')
    .eq('id_number', matriculation)
    .single()
  if (studentError || !student) {
    console.error('Error fetching student:', studentError)
    throw new Error('Oups, nous n\'avons pas trouvé cet étudiant')
  }
  if (!student.parent?.id) {
    throw new Error('Veillez dans un premier temps lier cet étudiant à son parent')
  }

  // Retrieve the student's active enrollment record
  const { data: enrollment, error: enrollmentError } = await client
    .from('student_school_class')
    .select('id')
    .eq('student_id', student.id)
    .eq('enrollment_status', 'accepted')
    .eq('is_active', true)
    .single()
  if (enrollmentError || !enrollment) {
    console.error('Error fetching enrollment:', enrollmentError)
    throw new Error('Oups, nous n\'avons pas trouvé cet étudiant')
  }

  // Fetch the payment plan and its installments
  const { data: paymentPlan, error: paymentPlanError } = await client
    .from('payment_plans')
    .select(`
      id,
      total_amount,
      amount_paid,
      installments: payment_installments(id, due_date, status)
    `)
    .eq('enrollment_id', enrollment.id)
    .single()
  if (paymentPlanError || !paymentPlan) {
    console.error('Error fetching payment plan:', paymentPlanError)
    throw new Error('Oups, nous n\'avons pas trouvé le plan de paiement')
  }

  // Get the next installment details via RPC
  const { data: nextInstallment, error: nextInstallmentError } = await client.rpc('get_locked_payment_details', { _enrollment_id: enrollment.id })
  if (nextInstallmentError) {
    console.error('Error fetching next installment:', nextInstallmentError)
    throw new Error('Oups, nous n\'avons pas trouvé la tranche de paiement suivante')
  }

  // Sort installments by due_date
  const installments = (paymentPlan.installments as Array<{ id: string, due_date: string, status: string }>)
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())

  // Find the last paid installment (if any)
  const lastPaidInstallment = installments.find(inst => inst.status === 'paid')

  // Build the common financial info fields
  const financialInfoBase = {
    totalTuition: paymentPlan.total_amount,
    remainingBalance: paymentPlan.total_amount - paymentPlan.amount_paid,
    installmentAmount: (nextInstallment as any).installment.amount,
  }

  // If no installment has been paid yet, return the student info without lastPayment
  if (!lastPaidInstallment) {
    return {
      id: student.id,
      photo: student.avatar_url ?? undefined,
      fullName: formatFullName(student.first_name, student.last_name),
      matriculation,
      financialInfo: financialInfoBase,
    }
  }

  // Otherwise, fetch the payment associated with the last paid installment
  const { data: payment, error: paymentError } = await client
    .from('payments')
    .select('amount, paid_at, payment_method')
    .eq('installment_id', lastPaidInstallment.id)
    .single()
  if (paymentError || !payment) {
    console.error('Error fetching payment:', paymentError)
    throw new Error('Oups, nous n\'avons pas trouvé le paiement')
  }

  return {
    id: student.id,
    photo: student.avatar_url ?? undefined,
    fullName: formatFullName(student.first_name, student.last_name),
    matriculation,
    financialInfo: {
      ...financialInfoBase,
      lastPayment: {
        date: new Date(payment.paid_at!),
        amount: payment.amount,
        method: payment.payment_method,
      },
    },
  }
}

export function NewPaymentDialog() {
  const { isNewTransaction, setNewTransaction } = useTransactionsStore()

  const [stage, setStage] = useState<'search' | 'payment'>('search')
  const [matriculation, setMatriculation] = useState('')

  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const handleSearch = async () => {
    if (!matriculation.trim())
      return

    setIsSearching(true)
    try {
      const student = await getStudent(matriculation)
      setSelectedStudent(student)
      setStage('payment')
    }
    catch (error) {
      console.error(`Failed to search student: ${error}`)
      toast.error('Aucun étudiant trouvé. Veuillez vérifier le numéro de matricule.')
    }
    finally {
      setIsSearching(false)
    }
  }

  const resetForm = () => {
    setStage('search')
    setMatriculation('')
    setSelectedStudent(null)
  }

  const handlePayment = async (_values: any) => {
    try {
      await createPayment(selectedStudent!.id, _values.amount, _values.paymentMethod)
      toast.success('Paiement effectué avec succès.')
      setNewTransaction(false)
      resetForm()
    }
    catch (error) {
      console.error(`Failed to process payment: ${error}`)
      toast.error((error as Error).message)
    }
  }

  return (
    <Dialog
      open={isNewTransaction}
      onOpenChange={(isOpen) => {
        setNewTransaction(isOpen)
        if (!isOpen)
          resetForm()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {stage === 'search' ? 'Rechercher un étudiant' : 'Nouveau paiement'}
          </DialogTitle>
        </DialogHeader>

        {stage === 'search'
          ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Matricule..."
                    value={matriculation}
                    onChange={e => setMatriculation(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !matriculation.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          : selectedStudent && (
            <div className="space-y-6">
              <StudentInformation student={selectedStudent} />
              <PaymentForm
                defaultAmount={selectedStudent.financialInfo.installmentAmount}
                onSubmit={handlePayment}
              />
            </div>
          )}
      </DialogContent>
    </Dialog>
  )
}
