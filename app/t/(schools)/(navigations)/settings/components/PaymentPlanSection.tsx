'use client'

import type { InstallmentTemplate as ITemplate } from '@/validations'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/utils'
import useTuitionStore from '@/store/tuitionStore'
import { AnimatePresence, motion } from 'framer-motion'
import { Edit2Icon, SeparatorHorizontal, Trash2Icon } from 'lucide-react'
import { startTransition, useOptimistic, useState } from 'react'
import { toast } from 'sonner'
import { AddInstallmentDialog } from './AddInstallmentDialogProps'

export interface PaymentPlanSectionProps {
  gradeId: number
  totalAmount: number
  paymentPlans: ITemplate[]
}

interface PaymentPlanRowProps {
  plan: ITemplate
}

function PaymentPlanRow({ plan }: PaymentPlanRowProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TableRow
      key={plan.id}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TableCell className="flex justify-end items-center">
        {/* Reserved space for the icon */}
        <div className="w-9 h-9 mr-2 relative">
          <AnimatePresence>
            {isHovered && (
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
        {/* The installment number stays in place because the container always reserves the same space */}
        <span>{plan.installmentNumber}</span>
      </TableCell>
      <TableCell className="text-center">
        {formatDate(plan.dueDate, 'dd MMM')}
      </TableCell>
      <TableCell className="text-center">
        {plan.dayBeforeNotification}
      </TableCell>
      <TableCell className="text-end">
        {formatCurrency(plan.fixedAmount ?? 0)}
      </TableCell>
      <TableCell className="flex items-center justify-center">
        <div className="flex space-x-1">
          <Button size="icon" variant="ghost">
            <Edit2Icon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost">
            <Trash2Icon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

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

  const remainingAmount = totalAmount - paymentPlans.reduce((acc, plan) => acc + (plan.fixedAmount ?? 0), 0)

  const maxInstallmentNumber = paymentPlans.reduce((acc, plan) => Math.max(acc, plan.installmentNumber), 0) + 1

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
              <span className="font-medium">
                {formatCurrency(remainingAmount)}
              </span>
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
                    <p>
                      Utile pour rappeler le parent de la date de paiement
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="text-end">Montant</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optimisticPlans[gradeId]?.map((plan: ITemplate) => (
              <PaymentPlanRow key={plan.id} plan={plan} />
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
