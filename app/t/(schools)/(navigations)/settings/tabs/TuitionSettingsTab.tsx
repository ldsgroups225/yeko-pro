'use client'

import type { TuitionSettings } from '@/validations'
import type { PaymentPlan } from '../dummyData'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { saveRecordIfDirty } from '@/lib/utils'
import useGradeStore from '@/store/gradeStore'
import useTuitionStore from '@/store/tuitionStore'
import { startTransition, useEffect, useOptimistic, useState } from 'react'
import { toast } from 'sonner'
import { PaymentPlanSection } from '../components/PaymentPlanSection'
import SettingsSection from '../components/SettingsSection'
import { TuitionTableRow } from '../components/TuitionTableRow'
import { generateDummyPaymentPlans } from '../dummyData'

export default function TuitionSettingsPage() {
  const { fetchTuitions, updateTuitionSettings, tuitions } = useTuitionStore()
  const { grades } = useGradeStore()

  const [showPaymentPlan, setShowPaymentPlan] = useState(false)
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([])
  const [showAddInstallment, setShowAddInstallment] = useState(false)

  const totalAmount = paymentPlans.reduce((sum, plan) => sum + plan.totalAmount, 0)
  const amountPaid = paymentPlans.reduce((sum, plan) => sum + plan.amountPaid, 0)
  const selectedGrade = grades.find(grade => grade.id === selectedGradeId)
  const dummyStatus: 'pending' | 'partial' | 'paid' | 'overdue' = 'pending'

  const [optimisticTuition, setOptimisticTuition] = useOptimistic<Record<number, TuitionSettings>>(
    tuitions.reduce((acc, tuition) => {
      acc[tuition.gradeId] = tuition
      return acc
    }, {} as Record<number, TuitionSettings>),
  )

  const fetchTuitionSettings = async () => {
    try {
      await fetchTuitions()
    }
    catch (error: any) {
      console.error('Error fetching tuition settings:', error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchTuitionSettings().then(() => {})
  }, [])

  useEffect(() => {
    if (selectedGradeId) {
      fetchPaymentPlans(selectedGradeId)
    }
  }, [selectedGradeId])

  async function fetchPaymentPlans(gradeId: number) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setPaymentPlans(generateDummyPaymentPlans(gradeId))
    }
    catch (error: any) {
      console.error('Error fetching payment plans:', error)
      toast.error(error.message)
    }
  }

  const handleTogglePaymentPlan = (show: boolean, gradeId: number | null = null) => {
    setShowPaymentPlan(show)
    setSelectedGradeId(show ? gradeId : null)
  }

  const handleSaveTuition = (gradeId: number, data: Partial<TuitionSettings>) => {
    startTransition(async () => {
      const current = optimisticTuition[gradeId] || {} as TuitionSettings

      await saveRecordIfDirty<TuitionSettings, number>(
        gradeId,
        data,
        current,
        setOptimisticTuition,
        updateTuitionSettings,
        {
          mergeId: false,
          errorHandler: error => toast.error(error.message),
          successHandler: () => toast.success('Scolarité mise à jour avec succès'),
        },
      )
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Configuration scolarité"
        description="Gérez les paramètres de scolarité de votre établissement"
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Niveau</TableHead>
                <TableHead className="w-[220px]">Frais annuels</TableHead>
                <TableHead className="w-[210px]">Remise d'État (%)</TableHead>
                <TableHead className="w-[150px]">Modifié le</TableHead>
                <TableHead className="w-[30px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map(grade => (
                <TuitionTableRow
                  key={grade.id}
                  grade={grade}
                  tuition={optimisticTuition[grade.id]}
                  isShowingPaymentPlan={showPaymentPlan && selectedGradeId === grade.id}
                  onTogglePaymentPlan={handleTogglePaymentPlan}
                  onSave={data => handleSaveTuition(grade.id, data)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-2 text-sm text-muted-foreground">
          <span>• Tout les frais sont en FCFA</span>
          <span>• La remise d'État = élèves affectés d'état</span>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Plan de paiement"
        description={`Configuration des tranches de paiement pour ${selectedGrade?.name || 'ce niveau'}`}
      >
        {showPaymentPlan
          ? (
              <PaymentPlanSection
                totalAmount={totalAmount}
                amountPaid={amountPaid}
                dummyStatus={dummyStatus}
                showAddInstallment={showAddInstallment}
                setShowAddInstallment={setShowAddInstallment}
              />
            )
          : (
              <div className="text-center text-sm text-muted-foreground">
                Cliquez sur l&apos;icône œil pour voir les tranches de paiement.
              </div>
            )}
      </SettingsSection>
    </div>
  )
}
