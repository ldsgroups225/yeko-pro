import type { IGrade } from '@/types'
import type { TuitionSettings } from '@/validations'
import type { RefObject } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
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
    governmentDiscountPercentage: tuition?.governmentDiscountPercentage || 0,
  })
  const annualFeeInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const governmentDiscountPercentageInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const prevTuitionRef = useRef(tuition)

  if (tuition !== prevTuitionRef.current) {
    setFormData({
      annualFee: tuition?.annualFee || 0,
      governmentDiscountPercentage: tuition?.governmentDiscountPercentage || 0,
    })
    prevTuitionRef.current = tuition
  }

  return (
    <TableRow>
      <TableCell>{grade.name}</TableCell>
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={annualFeeInputRef}
                min={0}
                max={1000000}
                value={formData.annualFee}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    annualFee: Number(e.target.value),
                  }))}
                className="max-w-[150px]"
              />
            )
          : (
              new Intl.NumberFormat('fr-FR').format(formData.annualFee)
            )}
      </TableCell>
      <TableCell>
        {isEditing
          ? (
              <NumberInput
                ref={governmentDiscountPercentageInputRef}
                min={0}
                max={100}
                suffix="%"
                value={formData.governmentDiscountPercentage}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    governmentDiscountPercentage: Number(e.target.value.replace(/.$/, '')),
                  }))}
                className="max-w-[100px]"
              />
            )
          : (
              `${formData.governmentDiscountPercentage}%`
            )}
      </TableCell>
      <TableCell>
        {tuition?.updatedAt
          ? new Date(tuition.updatedAt).toLocaleDateString('fr-FR')
          : '-'}
      </TableCell>
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
                    setFormData({
                      annualFee: tuition?.annualFee || 0,
                      governmentDiscountPercentage: tuition?.governmentDiscountPercentage || 0,
                    })
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
