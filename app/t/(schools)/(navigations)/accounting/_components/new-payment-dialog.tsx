// app/t/(schools)/(navigations)/accounting/_components/new-payment-dialog.tsx

'use client'

import type { StudentForPayment } from '@/types/accounting'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { createPayment, getStudentPaymentDetailsByMatriculation } from '@/services/paymentService'
import { useTransactionsStore } from '@/store'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PaymentForm } from './payment-form'
import { StudentInformation } from './student-information'

export function NewPaymentDialog() {
  const { isNewTransaction, setNewTransaction } = useTransactionsStore()

  const [stage, setStage] = useState<'search' | 'payment'>('search')
  const [matriculation, setMatriculation] = useState('')

  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentForPayment | null>(null)

  const handleSearch = async () => {
    if (!matriculation.trim())
      return

    setIsSearching(true)
    try {
      const student = await getStudentPaymentDetailsByMatriculation(matriculation)
      setSelectedStudent(student)
      setStage('payment')
    }
    catch (error) {
      console.error(`Failed to search student: ${error}`)
      toast.error((error as Error).message || 'Aucun étudiant trouvé. Veuillez vérifier le numéro de matricule.')
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
              {selectedStudent.financialInfo.remainingBalance > 0
                ? (
                    <PaymentForm
                      defaultAmount={selectedStudent.financialInfo.installmentAmount}
                      onSubmit={handlePayment}
                    />
                  )
                : (
                    <Card className="text-center text-muted-foreground border-2 bg-green-50 border-dotted border-green-500">
                      <CardHeader>
                        <CardTitle>
                          Bravo
                        </CardTitle>
                        <CardDescription>
                          Cet élève est à jour.
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  )}
            </div>
          )}
      </DialogContent>
    </Dialog>
  )
}
