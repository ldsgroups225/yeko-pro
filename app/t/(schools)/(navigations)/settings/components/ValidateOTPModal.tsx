'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Loader2, Mail, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { validateOTPAndAddUser } from '@/services/roleManagementService'

const validateSchema = z.object({
  otp: z.string().min(6, 'Le code OTP doit contenir 6 chiffres').max(6),
  // email: z.string().email('Adresse email invalide'),
})

type ValidateFormData = z.infer<typeof validateSchema>

interface ValidateOTPModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ValidateOTPModal({ isOpen, onClose, onSuccess }: ValidateOTPModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ValidateFormData>({
    resolver: zodResolver(validateSchema),
    defaultValues: {
      otp: '',
      // email: '',
    },
  })

  const handleSubmit = async (data: ValidateFormData) => {
    setIsLoading(true)

    try {
      const result = await validateOTPAndAddUser(data.otp)

      if (result.success) {
        toast({
          title: 'Utilisateur ajouté',
          description: result.message,
          action: <CheckCircle className="h-4 w-4 text-green-600" />,
        })

        onSuccess()
        form.reset()
        onClose()
      }
      else {
        toast({
          title: 'Erreur de validation',
          description: result.message,
          variant: 'destructive',
        })
      }
    }
    catch (error) {
      console.error('OTP validation error:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la validation.',
        variant: 'destructive',
      })
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Ajouter un utilisateur avec OTP
          </DialogTitle>
          <DialogDescription>
            Utilisez le code OTP que l'utilisateur vous a communiqué pour l'ajouter à votre école avec le rôle spécifié lors de l'invitation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* <div className="space-y-2">
            <Label htmlFor="email">Email de l'utilisateur</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              {...form.register('email')}
              className={form.formState.errors.email ? 'border-destructive' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="otp">Code OTP (6 chiffres)</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              {...form.register('otp')}
              className={`font-mono text-center text-xl tracking-wider ${form.formState.errors.otp ? 'border-destructive' : ''}`}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/\D/g, '')
                form.setValue('otp', value)
              }}
            />
            {form.formState.errors.otp && (
              <p className="text-sm text-destructive">
                {form.formState.errors.otp.message}
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Instructions :
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• L'utilisateur doit avoir reçu l'email d'invitation</li>
              <li>• Il doit avoir créé un compte s'il n'en avait pas</li>
              <li>• Utilisez exactement le code OTP qu'il vous a communiqué</li>
              <li>• Le code expire après 3 minutes</li>
              <li>• Le rôle a été défini lors de l'envoi de l'invitation</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Valider et ajouter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
