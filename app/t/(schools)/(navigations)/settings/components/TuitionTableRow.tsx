import type { IGrade } from '@/types'
import type { TuitionSettings } from '@/validations'
import type { RefObject } from 'react'
import { NumberInput } from '@/components/NumberInput'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { CheckCircle2, Edit2Icon, EyeIcon, EyeOffIcon, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
    stateDiscount: tuition?.stateDiscount || 0,
  })
  const annualFeeInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>
  const stateDiscountInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>

  useEffect(() => {
    setFormData({
      annualFee: tuition?.annualFee || 0,
      stateDiscount: tuition?.stateDiscount || 0,
    })
  }, [tuition])

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
                ref={stateDiscountInputRef}
                min={0}
                max={100}
                suffix="%"
                value={formData.stateDiscount}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    stateDiscount: Number(e.target.value.replace(/.$/, '')),
                  }))}
                className="max-w-[100px]"
              />
            )
          : (
              `${formData.stateDiscount}%`
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
                      stateDiscount: tuition?.stateDiscount || 0,
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
