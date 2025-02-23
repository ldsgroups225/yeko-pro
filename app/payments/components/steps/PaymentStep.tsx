'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { Phone } from 'lucide-react'
import { useState } from 'react'

interface PaymentMethod {
  id: string
  name: string
  operatorName: string
  logoUrl?: string
}

interface PaymentStepProps {
  amount: number
  paymentMethods: PaymentMethod[]
  onSubmit: (data: {
    method: string
    phoneNumber: string
  }) => void
  isLoading?: boolean
}

export function PaymentStep({
  amount,
  paymentMethods,
  onSubmit,
  isLoading = false,
}: PaymentStepProps) {
  const [method, setMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ method, phoneNumber })
  }

  if (isLoading) {
    return (
      <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <CardHeader>
        <h3 className="text-lg font-semibold text-center">Informations de paiement</h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Display */}
          <div className={cn(
            'p-4 rounded-lg text-center',
            'bg-background/50',
          )}
          >
            <p className="text-sm text-muted-foreground">Montant à payer</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
              }).format(amount)}
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label>Méthode de paiement</Label>
            <RadioGroup
              value={method}
              onValueChange={setMethod}
              className="grid grid-cols-2 gap-4"
            >
              {paymentMethods.map(pm => (
                <div key={pm.id}>
                  <RadioGroupItem
                    value={pm.id}
                    id={pm.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={pm.id}
                    className={cn(
                      'flex flex-col items-center justify-center rounded-lg border-2 border-muted p-4',
                      'hover:bg-accent hover:text-accent-foreground',
                      'peer-data-[state=checked]:border-primary',
                      '[&:has([data-state=checked])]:border-primary',
                    )}
                  >
                    {pm.logoUrl
                      ? (
                          <img
                            src={pm.logoUrl}
                            alt={pm.name}
                            className="h-12 w-12 object-contain"
                          />
                        )
                      : (
                          <div className="h-12 w-12 flex items-center justify-center bg-primary/10 rounded-full">
                            <Phone className="h-6 w-6 text-primary" />
                          </div>
                        )}
                    <span className="mt-2 text-sm font-medium">{pm.name}</span>
                    <span className="text-xs text-muted-foreground">{pm.operatorName}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Phone Number Input */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="Entrez votre numéro"
              className="bg-background/50"
              required
              pattern="[0-9]{10}"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">Format: 0X XX XX XX XX</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!method || !phoneNumber || phoneNumber.length !== 10}
          >
            Procéder au paiement
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
