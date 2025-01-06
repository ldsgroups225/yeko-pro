import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { useTeacherStore } from '@/store'
import { useState } from 'react'

interface InviteTeacherModalProps {
  schoolId: string
  isOpen: boolean
  onClose: () => void
}

export function InviteTeacherModal({ schoolId, isOpen, onClose }: InviteTeacherModalProps) {
  const [otp, setOtp] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const { toast } = useToast()

  const { inviteTeacher } = useTeacherStore()

  const handleGenerateInvite = async () => {
    setIsGenerating(true)
    try {
      const generatedOtp = await inviteTeacher(schoolId)
      setOtp(generatedOtp)
      toast({
        title: 'Invitation créée',
        description: `Code OTP généré : ${generatedOtp}`,
      })
    }
    catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de générer le code OTP.',
      })
    }
    finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inviter un enseignant</DialogTitle>
          <DialogDescription>
            Générez un code OTP pour inviter un enseignant à rejoindre votre école.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full text-center py-4">
          <Label htmlFor="otp" className="text-right font-mono text-3xl tracking-widest">
            {otp}
          </Label>
          <p className="text-muted-foreground text-xs">
            Valable jusqu'à demain
          </p>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleGenerateInvite} disabled={isGenerating}>
            {isGenerating ? 'Génération...' : 'Générer'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
