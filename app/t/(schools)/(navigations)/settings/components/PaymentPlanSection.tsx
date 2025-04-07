// app/t/(schools)/(navigations)/settings/components/PaymentPlanSection.tsx

'use client'

import type { InstallmentTemplate as ITemplate } from '@/validations'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { saveRecordIfDirty } from '@/lib/utils/saveDataIfDirty'
import useTuitionStore from '@/store/tuitionStore'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarIcon,
  CheckCircle2,
  Edit2Icon,
  SeparatorHorizontal,
  Trash2Icon,
  X,
} from 'lucide-react'
import { startTransition, useOptimistic, useState } from 'react'
import { toast } from 'sonner'
import { AddInstallmentDialog } from './AddInstallmentDialogProps'

/* =====================================================
   Types & Interfaces
===================================================== */

interface PaymentPlanFormData {
  // dueDate stored as a string in "YYYY-MM-DD" format
  dueDate: string
  dayBeforeNotification: number
  fixedAmount: number
}

export interface PaymentPlanSectionProps {
  gradeId: number
  totalAmount: number
  paymentPlans: ITemplate[]
}

// For the container, we need the optimistic update props.
export interface PaymentPlanRowProps {
  plan: ITemplate
  remainingAmount: number
  updateOptimisticRecord: (newData: Partial<ITemplate>) => void
  currentRecord: ITemplate
}

/* =====================================================
   Custom Hook: usePaymentPlanRowLogic
   - Handles form state, validations and submission logic.
   - Accepts extra parameters for optimistic updating.
===================================================== */

function usePaymentPlanRowLogic(
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

  const startEditing = () => setIsEditing(true)
  const cancelEditing = () => {
    setIsEditing(false)
    setFormData(initialFormData)
  }

  // Validate the form data.
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
    // Allow the previous amount to be reused.
    const availableAmount = remainingAmount + (plan.fixedAmount ?? 0)
    if (formData.fixedAmount > availableAmount) {
      return 'La tranche est supérieure à la somme restante'
    }
    if (formData.dayBeforeNotification < 0) {
      return 'Le nombre de jours de notification ne peut pas être négatif'
    }
    return null
  }

  // Adapter for optimistic state: saveRecordIfDirty expects a setter that accepts an updater returning a record.
  const setOptimisticRecordWrapper = (
    updater: (prev: Record<string, ITemplate>) => Record<string, ITemplate>,
  ) => {
    // Ensure plan.id is defined and cast it.
    const id = plan.id! as string
    const currentObj: Record<string, ITemplate> = { [id]: currentRecord }
    const newObj = updater(currentObj)
    updateOptimisticRecord(newObj[id])
  }

  // Handle saving the updated data using saveRecordIfDirty.
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

/* =====================================================
   Presentation Component: PaymentPlanRowView
   - Renders UI only; receives state and callbacks via props.
===================================================== */

interface PaymentPlanRowViewProps {
  plan: ITemplate
  isEditing: boolean
  formData: PaymentPlanFormData
  setFormData: React.Dispatch<React.SetStateAction<PaymentPlanFormData>>
  startEditing: () => void
  cancelEditing: () => void
  handleSave: () => void
}

function PaymentPlanRowView({
  plan,
  isEditing,
  formData,
  setFormData,
  startEditing,
  cancelEditing,
  handleSave,
}: PaymentPlanRowViewProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TableRow
      key={plan.id}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Installment Number Cell */}
      <TableCell className="flex justify-end items-center">
        <div className="w-9 h-9 mr-2 relative">
          <AnimatePresence>
            {isHovered && !isEditing && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <SeparatorHorizontal className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span>{plan.installmentNumber}</span>
      </TableCell>

      {/* Due Date Cell */}
      <TableCell className="text-center">
        <AnimatePresence mode="wait">
          {isEditing
            ? (
                <motion.div
                  key="edit-dueDate"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[120px] justify-between text-left font-normal',
                          !formData.dueDate && 'text-muted-foreground',
                        )}
                      >
                        {formData.dueDate
                          ? formatDate(formData.dueDate, 'dd MMM')
                          : <span>Pick a date</span>}
                        <CalendarIcon />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus
                        selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                        onSelect={dt =>
                          setFormData(prev => ({
                            ...prev,
                            dueDate: dt ? dt.toISOString().split('T')[0] : prev.dueDate,
                          }))}
                      />
                    </PopoverContent>
                  </Popover>
                </motion.div>
              )
            : (
                <motion.div
                  key="view-dueDate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatDate(plan.dueDate, 'dd MMM')}
                </motion.div>
              )}
        </AnimatePresence>
      </TableCell>

      {/* Notification Days Cell */}
      <TableCell className="text-center">
        <AnimatePresence mode="wait">
          {isEditing
            ? (
                <motion.div
                  key="edit-notify"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    type="number"
                    value={formData.dayBeforeNotification}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        dayBeforeNotification: Number(e.target.value),
                      }))}
                    className="border rounded p-1 text-center pl-4 w-[120px]"
                  />
                </motion.div>
              )
            : (
                <motion.div
                  key="view-notify"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {plan.dayBeforeNotification}
                </motion.div>
              )}
        </AnimatePresence>
      </TableCell>

      {/* Fixed Amount Cell */}
      <TableCell className="text-end">
        <AnimatePresence mode="wait">
          {isEditing
            ? (
                <motion.div
                  key="edit-amount"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    type="number"
                    value={formData.fixedAmount}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        fixedAmount: Number(e.target.value),
                      }))}
                    className="border rounded p-1 text-end pl-4 w-[120px]"
                  />
                </motion.div>
              )
            : (
                <motion.div
                  key="view-amount"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {formatCurrency(plan.fixedAmount ?? 0)}
                </motion.div>
              )}
        </AnimatePresence>
      </TableCell>

      {/* Action Buttons Cell */}
      <TableCell>
        <AnimatePresence mode="wait">
          {isEditing
            ? (
                <motion.div
                  key="edit-actions"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex space-x-1 items-center justify-center"
                >
                  <Button size="icon" onClick={handleSave}>
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={cancelEditing}>
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )
            : (
                <motion.div
                  key="view-actions"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex space-x-1 items-center justify-center"
                >
                  <Button size="icon" variant="ghost" onClick={startEditing}>
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
        </AnimatePresence>
      </TableCell>
    </TableRow>
  )
}

/* =====================================================
   Container Component: PaymentPlanRowContainer
   - Connects the logic hook with the presentation view.
   - Receives the optimistic update props.
===================================================== */

function PaymentPlanRowContainer({
  plan,
  remainingAmount,
  updateOptimisticRecord,
  currentRecord,
}: PaymentPlanRowProps) {
  const logic = usePaymentPlanRowLogic(
    plan,
    remainingAmount,
    updateOptimisticRecord,
    currentRecord,
  )

  return (
    <PaymentPlanRowView
      plan={plan}
      isEditing={logic.isEditing}
      formData={logic.formData}
      setFormData={logic.setFormData}
      startEditing={logic.startEditing}
      cancelEditing={logic.cancelEditing}
      handleSave={logic.handleSave}
    />
  )
}

/* =====================================================
   Main Section Component: PaymentPlanSection
===================================================== */

export function PaymentPlanSection({
  gradeId,
  totalAmount,
  paymentPlans,
}: PaymentPlanSectionProps) {
  const { updateInstallmentTemplate } = useTuitionStore()

  const [optimisticPlans, setOptimisticPlans] = useOptimistic<Record<number, ITemplate[]>>(
    paymentPlans.reduce((acc, plan) => {
      if (!acc[plan.gradeId]) {
        acc[plan.gradeId] = []
      }
      acc[plan.gradeId].push(plan)
      return acc
    }, {} as Record<number, ITemplate[]>),
  )

  const remainingAmount
    = totalAmount - paymentPlans.reduce((acc, plan) => acc + (plan.fixedAmount ?? 0), 0)

  const maxInstallmentNumber
    = paymentPlans.reduce((acc, plan) => Math.max(acc, plan.installmentNumber), 0) + 1

  // Helper to update a single record within the optimistic state.
  const updateOptimisticRecord = (planId: string | number, newData: Partial<ITemplate>) => {
    startTransition(async () => {
      setOptimisticPlans((prev) => {
        const updatedRecords = (prev[gradeId] || []).map(r =>
          r.id === planId ? { ...r, ...newData } : r,
        )
        return { ...prev, [gradeId]: updatedRecords }
      })
    })
  }

  async function handleAddInstallment(data: ITemplate) {
    startTransition(async () => {
      setOptimisticPlans(prev => ({
        ...prev,
        [gradeId]: [...(prev[gradeId] || []), { ...data, id: Date.now().toString() }],
      }))

      try {
        await updateInstallmentTemplate(data)
        toast.success('Tranche ajoutée avec succès')
      }
      catch (error: any) {
        toast.error(error.message)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        {remainingAmount > 0 && (
          <div className="rounded-md border p-4 bg-muted/50">
            <div className="flex justify-between">
              <span>Reste à distribuer</span>
              <span className="font-medium">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px] text-end">Ordre</TableHead>
              <TableHead className="text-center">Date limite</TableHead>
              <TableHead className="flex items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost">Notifier le</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Utile pour rappeler le parent de la date de paiement</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-end">Montant</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticPlans[gradeId]?.map((plan: ITemplate) => (
              <PaymentPlanRowContainer
                key={plan.id}
                plan={plan}
                remainingAmount={remainingAmount}
                currentRecord={plan}
                updateOptimisticRecord={newData => updateOptimisticRecord(plan.id!, newData)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
      <AddInstallmentDialog
        gradeId={gradeId}
        onSubmit={handleAddInstallment}
        remainingAmount={remainingAmount}
        installmentNumber={maxInstallmentNumber}
      />
    </div>
  )
}
