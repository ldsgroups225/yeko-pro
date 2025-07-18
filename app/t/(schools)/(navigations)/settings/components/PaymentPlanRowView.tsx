'use client'

import type { PaymentPlanFormData } from './PaymentPlanRowLogic'
import type { InstallmentTemplate as ITemplate } from '@/validations'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarIcon,
  CheckCircle2,
  Edit2Icon,
  Trash2Icon,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface PaymentPlanRowViewProps {
  plan: ITemplate
  isEditing: boolean
  formData: PaymentPlanFormData
  setFormData: React.Dispatch<React.SetStateAction<PaymentPlanFormData>>
  startEditing: () => void
  cancelEditing: () => void
  handleSave: () => void
}

export function PaymentPlanRowView({
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
      <TableCell>
        {isEditing
          ? (
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !formData.dueDate && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate
                        ? (
                            formatDate(formData.dueDate)
                          )
                        : (
                            <span>Choisir une date</span>
                          )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.dueDate)}
                      onSelect={date =>
                        setFormData(prev => ({
                          ...prev,
                          dueDate: date?.toISOString().split('T')[0] ?? '',
                        }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )
          : (
              formatDate(plan.dueDate)
            )}
      </TableCell>

      <TableCell>
        {isEditing
          ? (
              <Input
                type="number"
                value={formData.dayBeforeNotification}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    dayBeforeNotification: Number.parseInt(e.target.value) || 0,
                  }))}
                className="w-[100px]"
              />
            )
          : (
              plan.dayBeforeNotification
            )}
      </TableCell>

      <TableCell>
        {isEditing
          ? (
              <Input
                type="number"
                value={formData.fixedAmount}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    fixedAmount: Number.parseInt(e.target.value) || 0,
                  }))}
                className="w-[120px]"
              />
            )
          : (
              formatCurrency(plan.fixedAmount ?? 0)
            )}
      </TableCell>

      <TableCell className="text-right">
        <AnimatePresence>
          {isEditing
            ? (
                <div className="flex items-center justify-end gap-2">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSave}
                          className="h-8 w-8"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Sauvegarder</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEditing}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Annuler</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                </div>
              )
            : (
                isHovered && (
                  <div className="flex items-center justify-end gap-2">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={startEditing}
                            className="h-8 w-8"
                          >
                            <Edit2Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modifier</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Supprimer</p>
                        </TooltipContent>
                      </Tooltip>
                    </motion.div>
                  </div>
                )
              )}
        </AnimatePresence>
      </TableCell>
    </TableRow>
  )
}
