// app/t/(schools)/(navigations)/settings/tabs/TuitionSettingsTab.tsx

'use client'

import type { TuitionSettings } from '@/validations'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { saveRecordIfDirty } from '@/lib/utils'
import useGradeStore from '@/store/gradeStore'
import useTuitionStore from '@/store/tuitionStore'
import { PlusCircle } from 'lucide-react'
import { startTransition, useCallback, useEffect, useOptimistic, useState } from 'react'
import { toast } from 'sonner'
import { PaymentPlanSection } from '../components/PaymentPlanSection'
import SettingsSection from '../components/SettingsSection'
import { TuitionTableRow } from '../components/TuitionTableRow'

export default function TuitionSettingsPage() {
  const {
    tuitions,
    fetchTuitions,
    updateTuitionSettings,
    setShowAddTemplateModal,
    fetchInstallmentTemplates,
    installmentTemplates: paymentPlans,
  } = useTuitionStore()
  const { grades } = useGradeStore()

  const [showPaymentPlan, setShowPaymentPlan] = useState(false)
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null)

  const selectedGrade = grades.find(grade => grade.id === selectedGradeId)

  const fetchInstallmentTemplatesMemoized = useCallback(async () => {
    try {
      await fetchInstallmentTemplates(selectedGradeId!)
    }
    catch (error: any) {
      toast.error(error.message)
    }
  }, [selectedGradeId])

  const [optimisticTuition, setOptimisticTuition] = useOptimistic<Record<number, TuitionSettings>>(
    tuitions.reduce((acc, tuition) => {
      acc[tuition.gradeId] = tuition
      return acc
    }, {} as Record<number, TuitionSettings>),
  )

  const fetchTuitionSettings = useCallback(async () => {
    try {
      await fetchTuitions()
    }
    catch (error: any) {
      console.error('Error fetching tuition settings:', error)
      toast.error(error.message)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function loadData() {
      await fetchTuitionSettings()

      if (mounted && selectedGradeId) {
        try {
          await fetchInstallmentTemplatesMemoized()
        }
        catch (error: any) {
          console.error('Error fetching installment templates:', error)
          toast.error(error.message)
        }
      }
    }

    loadData()
    return () => {
      mounted = false
    }
  }, [selectedGradeId])

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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[80px]">Niveau</TableHead>
                <TableHead className="min-w-[150px]">Scolarité Annuelle</TableHead>
                <TableHead className="min-w-[150px]">Scolarité Orient.</TableHead>
                <TableHead className="min-w-[150px]">Reduction Orphelin</TableHead>
                <TableHead className="min-w-[150px]">Frais Cantine</TableHead>
                <TableHead className="min-w-[150px]">Frais Transport</TableHead>
                <TableHead className="min-w-[100px]">Modifié le</TableHead>
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
          <span>• Scolarité Orient. État = élèves affectés d'état</span>
        </div>
      </SettingsSection>

      <SettingsSection
        title={`Plan de paiement ${selectedGrade?.name || ''}`}
        description={`Configuration des tranches de paiement pour ${selectedGrade?.name || 'ce niveau'}`}
        actions={
          showPaymentPlan
            ? (
                <TooltipProvider>
                  <Tooltip delayDuration={500}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowAddTemplateModal(true)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Ajouter une tranche de paiement
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            : <div className="w-9 h-9" />
        }
      >
        {showPaymentPlan
          ? (
              <PaymentPlanSection
                gradeId={selectedGradeId!}
                paymentPlans={paymentPlans}
                totalAmount={optimisticTuition[selectedGradeId!]?.annualFee || 0}
              />
            )
          : (
              <div className="text-center text-sm text-muted-foreground">
                Cliquez sur l'icône œil pour voir les tranches de paiement.
              </div>
            )}
      </SettingsSection>
    </div>
  )
}
