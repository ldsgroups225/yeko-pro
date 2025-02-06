import type { InstallmentTemplate as InstallmentTemplateType } from '@/validations'
import { DatePicker } from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { installmentTemplateSchema } from '@/validations'
import { zodResolver } from '@hookform/resolvers/zod'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface AddInstallmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: InstallmentTemplateType) => void
  gradeId?: number
}

export const AddInstallmentDialog: React.FC<AddInstallmentDialogProps> = ({ open, onOpenChange, onSubmit, gradeId }) => {
  const [showAddInstallment, setShowAddInstallment] = useState(open)

  const form = useForm<InstallmentTemplateType>({
    resolver: zodResolver(installmentTemplateSchema),
    defaultValues: {
      dueDate: new Date(),
      fixedAmount: 0,
      installmentNumber: 1,
      dayBeforeNotification: 7,
      gradeId,
    },
    mode: 'onSubmit',
  })

  const { formState } = form

  /**
   * Handles the form submission event.
   * Prevents default submission, validates the form, calls the onSubmit handler with form data,
   * closes the dialog, and resets the form.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - The form submit event.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    form.handleSubmit((data) => {
      onSubmit(data)
      setShowAddInstallment(false)
      form.reset()
    })()
  }

  return (
    <Dialog open={showAddInstallment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une tranche</DialogTitle>
          <DialogDescription>
            Définissez les détails de la nouvelle tranche de paiement
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="installmentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de tranche</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="1, 2, 3..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date limite</FormLabel>
                <FormControl>
                  <DatePicker
                    date={field.value}
                    onSelect={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fixedAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (FCFA)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={field.value === null ? '' : String(field.value)}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dayBeforeNotification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jours avant notification (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="ex: 7"
                    value={field.value === null ? '' : String(field.value)}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="submit"
              disabled={!formState.isValid}
            >
              Sauvegarder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
