// app/payments/components/steps/Step5Payment.tsx

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { enrollStudent } from '../../actions'

const mockPaymentMethods = [
  {
    id: 'orange',
    name: 'Orange Money',
    operatorName: 'Orange CI',
    imageUrl: '/payment-methods/orange.png',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    operatorName: 'MTN CI',
    imageUrl: '/payment-methods/mtn.png',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  {
    id: 'moov',
    name: 'Moov Money',
    operatorName: 'Moov Africa',
    imageUrl: '/payment-methods/moov.png',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'wave',
    name: 'Wave',
    operatorName: 'Wave Mobile Money',
    imageUrl: '/payment-methods/wave.png',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
]

const paymentSchema = z.object({
  method: z.enum(['orange', 'mtn', 'moov', 'wave'] as const, {
    required_error: 'Veuillez sélectionner un mode de paiement',
  }),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface Step5PaymentProps {
  onBack: () => void
  onComplete: () => void
  amount: number
  studentId: string
  schoolId: string
  gradeId: number
  isStateAssigned: boolean
  isOrphan: boolean
  hasCanteenSubscription: boolean
  hasTransportSubscription: boolean
  studentName: string
  schoolName: string
}

export function Step5Payment({
  onBack,
  onComplete,
  amount,
  studentId,
  schoolId,
  gradeId,
  isStateAssigned,
  isOrphan,
  hasCanteenSubscription,
  hasTransportSubscription,
  studentName,
  schoolName,
}: Step5PaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const YEKO_AMOUNT = 10000

  const amountToPay = YEKO_AMOUNT + amount * 0

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  })

  const handlePayment = async (data: PaymentFormData) => {
    setIsProcessing(true)
    setError(null)

    try {
      await enrollStudent({
        studentId,
        schoolId,
        gradeId,
        isStateAssigned,
        isOrphan,
        hasCanteenSubscription,
        hasTransportSubscription,
      })

      // TODO: Implement payment processing with selected method
      console.warn('Implement payment processing', data)
      onComplete()
    }
    catch (error) {
      console.error('Payment processing failed:', error)
      setError((error as Error).message)
    }
    finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paiement des frais de scolarité</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sélectionnez votre mode de paiement préféré pour procéder au règlement
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Récapitulatif</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">École:</span>
                  {' '}
                  {schoolName}
                </p>
                <p>
                  <span className="text-muted-foreground">Élève:</span>
                  {' '}
                  {studentName}
                </p>
                <p>
                  <span className="text-muted-foreground">Montant à payer:</span>
                  {' '}
                  <span className="font-semibold">
                    {amountToPay.toLocaleString('fr-FR')}
                    {' '}
                    FCFA
                  </span>
                </p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Mode de paiement</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {mockPaymentMethods.map(method => (
                            <FormItem key={method.id}>
                              <FormControl>
                                <div
                                  className={cn(
                                    'rounded-lg border-2 p-4 cursor-pointer transition-colors',
                                    method.bgColor,
                                    method.borderColor,
                                    field.value === method.id
                                      ? 'ring-2 ring-primary ring-offset-2'
                                      : 'hover:bg-muted/50',
                                  )}
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value={method.id} id={method.id} />
                                    <label
                                      htmlFor={method.id}
                                      className="flex flex-1 items-center space-x-3 cursor-pointer"
                                    >
                                      <img
                                        src={method.imageUrl}
                                        alt={method.name}
                                        className="w-10 h-10 object-contain"
                                      />
                                      <div>
                                        <p className="font-medium">{method.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {method.operatorName}
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              </FormControl>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button type="button" variant="outline" onClick={onBack}>
                    Retour
                  </Button>
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing ? 'Traitement en cours...' : 'Payer maintenant'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
