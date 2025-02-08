'use client'

import type { InstallmentTemplate as ITemplate } from '@/validations'
import { saveRecordIfDirty } from '@/lib/utils/saveDataIfDirty'
import useTuitionStore from '@/store/tuitionStore'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export interface PaymentPlanFormData {
  dueDate: string
  dayBeforeNotification: number
  fixedAmount: number
}

export function usePaymentPlanRowLogic(
  plan: ITemplate,
  remainingAmount: number,
  updateOptimisticRecord: (newData: Partial<ITemplate>) => void,
  currentRecord: ITemplate,
) {
  const { updateInstallmentTemplate } = useTuitionStore()
  const initialFormData: PaymentPlanFormData = {
    dueDate:
      typeof plan.dueDate === 'string'
        ? plan.dueDate
        : new Date(plan.dueDate).toISOString().split('T')[0],
    dayBeforeNotification: plan.dayBeforeNotification ?? 0,
    fixedAmount: plan.fixedAmount ?? 0,
  }
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PaymentPlanFormData>(initialFormData)

  useEffect(() => {
    setFormData(initialFormData)
  }, [plan])

  const startEditing = () => setIsEditing(true)
  const cancelEditing = () => {
    setIsEditing(false)
    setFormData(initialFormData)
  }

  const validateFormData = (): string | null => {
    if (!formData.dueDate) {
      return 'Veuillez saisir une date d\'échéance'
    }
    if (Number.isNaN(Date.parse(formData.dueDate))) {
      return 'La date d\'échéance est invalide'
    }
    const inputDueDate = new Date(formData.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (inputDueDate < today) {
      return 'La date d\'échéance ne peut pas être dans le passé'
    }
    if (formData.fixedAmount <= 0) {
      return 'Veuillez saisir une tranche positive'
    }
    const availableAmount = remainingAmount + (plan.fixedAmount ?? 0)
    if (formData.fixedAmount > availableAmount) {
      return 'La tranche est supérieure à la somme restante'
    }
    if (formData.dayBeforeNotification < 0) {
      return 'Le nombre de jours de notification ne peut pas être négatif'
    }
    return null
  }

  const setOptimisticRecordWrapper = (
    updater: (prev: Record<string, ITemplate>) => Record<string, ITemplate>,
  ) => {
    const id = plan.id! as string
    const currentObj: Record<string, ITemplate> = { [id]: currentRecord }
    const newObj = updater(currentObj)
    updateOptimisticRecord(newObj[id])
  }

  const handleSave = async () => {
    const error = validateFormData()
    if (error) {
      toast.error(error)
      return
    }

    await saveRecordIfDirty<ITemplate, string>(
      plan.id!,
      {
        ...formData,
        dueDate: new Date(formData.dueDate),
      },
      currentRecord,
      setOptimisticRecordWrapper,
      updateInstallmentTemplate,
      {
        mergeId: true,
        errorHandler: error => toast.error(error.message),
        successHandler: () => toast.success('Tranche mise à jour avec succès'),
      },
    )
    setIsEditing(false)
  }

  return {
    isEditing,
    formData,
    setFormData,
    startEditing,
    cancelEditing,
    handleSave,
  }
}
