import type { InstallmentTemplate as InstallmentTemplateType } from '@/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { DatePicker } from '@/components/DatePicker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import useTuitionStore from '@/store/tuitionStore'
import { installmentTemplateSchema } from '@/validations'

interface AddInstallmentDialogProps {
  gradeId: number
  remainingAmount?: number
  installmentNumber: number
  onSubmit: (data: InstallmentTemplateType) => void
}

export const AddInstallmentDialog: React.FC<AddInstallmentDialogProps> = ({
  gradeId,
  onSubmit,
  remainingAmount,
  installmentNumber = 1,
}) => {
  const { showAddTemplateModal, setShowAddTemplateModal } = useTuitionStore()

  const form = useForm<InstallmentTemplateType>({
    resolver: zodResolver(installmentTemplateSchema),
    defaultValues: {
      gradeId,
      fixedAmount: 0,
      installmentNumber,
      dueDate: new Date(),
      dayBeforeNotification: 7,
    },
    mode: 'onChange',
  })

  const { formState } = form

  /**
   * Handles the form submission event.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    form.handleSubmit((data) => {
      onSubmit(data)
      setShowAddTemplateModal(false)
      form.reset()
    })()
  }

  return (
    <Dialog open={showAddTemplateModal} onOpenChange={setShowAddTemplateModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une tranche</DialogTitle>
          <DialogDescription>
            Définissez les détails de la nouvelle tranche de paiement
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="installmentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre de tranche</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      min="1"
                      type="number"
                      placeholder="1, 2, 3..."
                      value={field.value}
                      onChange={e => field.onChange(Number.parseInt(e.target.value))}
                    />
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
                    <DatePicker date={field.value} onSelect={field.onChange} className="w-full" />
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
                      max={remainingAmount?.toString() ?? undefined}
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
              name="fixedAmountOfAffected"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant orienté (FCFA)</FormLabel>
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
              <Button type="submit" disabled={!formState.isValid}>
                Sauvegarder
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
