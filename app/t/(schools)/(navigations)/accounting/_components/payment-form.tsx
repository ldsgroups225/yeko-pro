import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAYMENT_METHOD, PAYMENT_METHOD_OPTIONS } from '@/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const paymentFormSchema = z.object({
  amount: z.string().refine(val => !Number.isNaN(Number(val)) && Number(val) > 0, {
    message: 'Le montant doit être un nombre positif',
  }),
  paymentMethod: z.nativeEnum(PAYMENT_METHOD),
  reference: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

interface PaymentFormProps {
  defaultAmount?: number
  onSubmit: (values: PaymentFormValues) => Promise<void>
}

export function PaymentForm({ defaultAmount, onSubmit }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: defaultAmount?.toString() || '',
      paymentMethod: PAYMENT_METHOD.CASH,
      reference: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Le montant</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Le moyen de paiement</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Moyen de paiement" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  { PAYMENT_METHOD_OPTIONS.map(method => (
                    <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Le numéro de référence (Facultatif)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Entrer le numéro de référence" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Traitement...' : 'Confirmer le paiement'}
        </Button>
      </form>
    </Form>
  )
}
