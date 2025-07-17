// app/t/(schools)/(navigations)/settings/components/TuitionTableRow.tsx

import type { IGrade } from '@/types'
import type { TuitionSettings } from '@/validations'
import type { RefObject } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle2, Edit2Icon, EyeIcon, EyeOffIcon, X } from 'lucide-react'
import { useRef, useState } from 'react'

export interface TuitionTableRowProps {
  grade: IGrade
  tuition?: TuitionSettings
  isShowingPaymentPlan: boolean
  onTogglePaymentPlan: (show: boolean, gradeId: number | null) => void
  onSave: (data: Partial<TuitionSettings>) => void
}

export function TuitionTableRow({
  grade,
  tuition,
  isShowingPaymentPlan,
  onTogglePaymentPlan,
  onSave,
}: TuitionTableRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    annualFee: tuition?.annualFee || 0,
    governmentAnnualFee: tuition?.governmentAnnualFee || 0,
    orphanDiscountAmount: tuition?.orphanDiscountAmount || 0,
    canteenFee: tuition?.canteenFee || 0,
    transportationFee: tuition?.transportationFee || 0,
  })

  // Refs for inputs
  const annualFeeInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const governmentAnnualFeeInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const orphanDiscountAmountInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const canteenFeeInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const transportationFeeInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>

  // Store the previous tuition for comparison
  const prevTuitionRef = useRef(tuition)

  // Calculate whether data needs to be reset based on tuition changes
  const needsReset = tuition !== prevTuitionRef.current

  // Update ref and reset form data when tuition changes
  if (needsReset) {
    prevTuitionRef.current = tuition
    // Reset form data immediately during render
    setFormData({
      annualFee: tuition?.annualFee || 0,
      governmentAnnualFee: tuition?.governmentAnnualFee || 0,
      orphanDiscountAmount: tuition?.orphanDiscountAmount || 0,
      canteenFee: tuition?.canteenFee || 0,
      transportationFee: tuition?.transportationFee || 0,
    })
  }

  const resetFormData = () => {
    setFormData({
      annualFee: tuition?.annualFee || 0,
      governmentAnnualFee: tuition?.governmentAnnualFee || 0,
      orphanDiscountAmount: tuition?.orphanDiscountAmount || 0,
      canteenFee: tuition?.canteenFee || 0,
      transportationFee: tuition?.transportationFee || 0,
    })
  }

  return (
    <TableRow>
      <TableCell>{grade.name}</TableCell>
      {/* Annual Fee */}
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={annualFeeInputRef}
                min={0}
                max={10000000}
                thousandSeparator=" "
                decimalSeparator=","
                stepper={10000}
                value={formData.annualFee}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    annualFee: value ?? 0,
                  }))}
                className="max-w-[150px]"
              />
            )
          : (
              formatCurrency(formData.annualFee)
            )}
      </TableCell>
      {/* Government Annual Fee */}
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={governmentAnnualFeeInputRef}
                min={0}
                max={10000000}
                thousandSeparator=" "
                decimalSeparator=","
                stepper={10000}
                value={formData.governmentAnnualFee}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    governmentAnnualFee: value ?? 0,
                  }))}
                className="max-w-[150px]"
              />
            )
          : (
              formatCurrency(formData.governmentAnnualFee)
            )}
      </TableCell>
      {/* Orphan Discount Amount */}
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={orphanDiscountAmountInputRef}
                min={0}
                max={10000000}
                thousandSeparator=" "
                decimalSeparator=","
                stepper={5000}
                value={formData.orphanDiscountAmount}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    orphanDiscountAmount: value ?? 0,
                  }))}
                className="max-w-[150px]"
              />
            )
          : (
              formatCurrency(formData.orphanDiscountAmount)
            )}
      </TableCell>
      {/* Canteen Fee */}
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={canteenFeeInputRef}
                min={0}
                max={10000000}
                thousandSeparator=" "
                decimalSeparator=","
                stepper={5000}
                value={formData.canteenFee}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    canteenFee: value ?? 0,
                  }))}
                className="max-w-[150px]"
              />
            )
          : (
              formatCurrency(formData.canteenFee)
            )}
      </TableCell>
      {/* Transportation Fee */}
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={transportationFeeInputRef}
                min={0}
                max={10000000}
                thousandSeparator=" "
                decimalSeparator=","
                stepper={5000}
                value={formData.transportationFee}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    transportationFee: value ?? 0,
                  }))}
                className="max-w-[150px]"
              />
            )
          : (
              formatCurrency(formData.transportationFee)
            )}
      </TableCell>
      {/* Updated At */}
      <TableCell>
        {tuition?.updatedAt
          ? new Date(tuition.updatedAt).toLocaleDateString('fr-FR')
          : '-'}
      </TableCell>
      {/* Actions */}
      <TableCell className="flex items-center justify-end">
        {isEditing
          ? (
              <div className="flex space-x-2">
                <Button
                  size="icon"
                  onClick={() => {
                    onSave(formData)
                    setIsEditing(false)
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    resetFormData()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          : (
              <div className="flex space-x-2">
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit2Icon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onTogglePaymentPlan(!isShowingPaymentPlan, grade.id)}
                >
                  {isShowingPaymentPlan
                    ? (
                        <EyeOffIcon className="h-4 w-4" />
                      )
                    : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                </Button>
              </div>
            )}
      </TableCell>
    </TableRow>
  )
}
