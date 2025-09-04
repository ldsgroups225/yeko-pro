'use client'

import type { InvitationRequest } from '@/services/roleManagementService'
import { zodResolver } from '@hookform/resolvers/zod'
import { Briefcase, Calculator, Loader2, Mail, Shield, Users } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { inviteUserToSchool } from '@/services/roleManagementService'
import useGradeStore from '@/store/gradeStore'
import { ERole } from '@/types'

const inviteSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  role: z.nativeEnum(ERole, { message: 'Veuillez sélectionner un rôle' }),
  grade: z.number().optional(),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (otp: string, email: string, userExists: boolean) => void
  schoolId: string
}

const ROLE_OPTIONS = [
  { value: ERole.DIRECTOR, label: 'Directeur', icon: Shield, description: 'Accès complet au système' },
  { value: ERole.CASHIER, label: 'Caissier / Caissière', icon: Calculator, description: 'Enregistre les paiements de scolarité' },
  { value: ERole.EDUCATOR, label: 'Éducateur', icon: Users, description: 'Gestion de la vie scolaire et éducation' },
  { value: ERole.ACCOUNTANT, label: 'Comptable', icon: Briefcase, description: 'Gestion comptable et financière' },
  // { value: ERole.HEADMASTER, label: 'Direction / Proviseur', icon: Crown, description: 'Direction générale de l\'établissement' },
]

export function InviteUserModal({ isOpen, onClose, onSuccess, schoolId }: InviteUserModalProps) {
  const { grades } = useGradeStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: ERole.CASHIER,
      grade: undefined,
    },
  })

  const handleSubmit = async (data: InviteFormData) => {
    if (!schoolId) {
      toast.error('Aucune école associée', { duration: 7000 })
      return
    }

    setIsLoading(true)

    try {
      const request: InvitationRequest = {
        email: data.email.toLowerCase(),
        role: data.role,
        grade: data.grade,
        gradeName: data.grade ? grades.find(g => g.id === data.grade)?.name : undefined,
        schoolId,
      }

      const result = await inviteUserToSchool(request)
      if (result.success && result.otp) {
        toast.success(result.message)

        onSuccess(result.otp, data.email, result.userExists)

        form.reset()
        onClose()
      }
      else {
        toast.error(result.message, { duration: 7000 })
      }
    }
    catch (error) {
      console.error('Invitation error:', error)
      toast('Une erreur est survenue lors de l\'envoi de l\'invitation.', { duration: 7000 })
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
            <Mail className="h-5 w-5" />
            Inviter un nouveau membre
          </DialogTitle>
          <DialogDescription>
            Invitez un utilisateur à rejoindre votre école. Il recevra un email avec un code OTP à vous communiquer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={form.watch('role')?.toString() || ''}
              onValueChange={value => form.setValue('role', Number.parseInt(value) as ERole)}
            >
              <SelectTrigger className={form.formState.errors.role ? 'border-destructive' : ''}>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Est pour le niveau (optionnel)</Label>
            <Select
              value={form.watch('grade')?.toString() || ''}
              onValueChange={value => form.setValue('grade', Number.parseInt(value))}
            >
              <SelectTrigger className={form.formState.errors.grade ? 'border-destructive' : ''}>
                <SelectValue placeholder="Sélectionner son niveau" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => {
                  return (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-start">
                          <p className="font-medium">{grade.name}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {form.formState.errors.grade && (
              <p className="text-sm text-destructive">
                {form.formState.errors.grade.message}
              </p>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">À savoir:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• L'utilisateur recevra un email avec un code OTP</li>
              <li>• Le code OTP est valide pendant 3 minutes</li>
              <li>• S'il n'a pas de compte, il devra d'abord s'inscrire</li>
              <li>• Il devra vous communiquer le code OTP pour être ajouté</li>
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
              Envoyer l'invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
