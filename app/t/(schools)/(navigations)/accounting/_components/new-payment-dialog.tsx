'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { mockFetchStudent } from '@/constants/mocks'
import { useTransactionsStore } from '@/store'
import { Search } from 'lucide-react'
import { useState } from 'react'
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

export function NewPaymentDialog() {
  const { isNewTransaction, setNewTransaction } = useTransactionsStore()

  const [stage, setStage] = useState<'search' | 'payment'>('search')
  const [matriculation, setMatriculation] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { toast } = useToast()

  const handleSearch = async () => {
    if (!matriculation.trim())
      return

    setIsSearching(true)
    try {
      // TODO: Replace with actual API call
      const student = await mockFetchStudent(matriculation)
      setSelectedStudent(student)
      setStage('payment')
    }
    catch (error) {
      console.error(`Failed to search student: ${error}`)
      toast({
        title: 'Error',
        description: 'Aucun étudiant trouvé. Veuillez vérifier le numéro de matricule.',
        variant: 'destructive',
      })
    }
    finally {
      setIsSearching(false)
    }
  }

  const handlePayment = async (_values: any) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Succès',
        description: 'Paiement effectué avec succès.',
      })
      setNewTransaction(false)
      // TODO: resetForm()
    }
    catch (error) {
      console.error(`Failed to process payment: ${error}`)
      toast({
        title: 'Erreur',
        description: 'Une erreur s\'est produite. Veuillez réessayer.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setStage('search')
    setMatriculation('')
    setSelectedStudent(null)
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
