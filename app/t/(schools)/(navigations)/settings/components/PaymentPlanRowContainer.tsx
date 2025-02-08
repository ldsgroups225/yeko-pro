'use client'

import type { InstallmentTemplate as ITemplate } from '@/validations'
import { usePaymentPlanRowLogic } from './PaymentPlanRowLogic'
import { PaymentPlanRowView } from './PaymentPlanRowView'

export interface PaymentPlanRowProps {
  plan: ITemplate
  remainingAmount: number
  updateOptimisticRecord: (newData: Partial<ITemplate>) => void
  currentRecord: ITemplate
}

export function PaymentPlanRowContainer({
  plan,
  remainingAmount,
  updateOptimisticRecord,
  currentRecord,
}: PaymentPlanRowProps) {
  const {
    isEditing,
    formData,
    setFormData,
    startEditing,
    cancelEditing,
    handleSave,
  } = usePaymentPlanRowLogic(plan, remainingAmount, updateOptimisticRecord, currentRecord)

  return (
    <PaymentPlanRowView
      plan={plan}
      isEditing={isEditing}
      formData={formData}
      setFormData={setFormData}
      startEditing={startEditing}
      cancelEditing={cancelEditing}
      handleSave={handleSave}
    />
  )
}
