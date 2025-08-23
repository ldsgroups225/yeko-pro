'use client'

import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Mail,
  UserPlus,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OTPConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  otp: string
  email: string
  userExists: boolean
  onCopyOTP: (otp: string) => void
}

export function OTPConfirmModal({
  isOpen,
  onClose,
  // otp,
  email,
  userExists,
  // onCopyOTP,
}: OTPConfirmModalProps) {
  // const [copied, setCopied] = useState(false)

  // const handleCopy = () => {
  //   onCopyOTP(otp)
  //   setCopied(true)
  //   setTimeout(() => setCopied(false), 2000)
  // }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Invitation envoyée avec succès
          </DialogTitle>
          <DialogDescription>
            L'email d'invitation a été envoyé à
            {' '}
            <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Status Alert */}
          {userExists
            ? (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Utilisateur existant</strong>
                    {' '}
                    - Cette personne a déjà un compte Yeko Pro.
                  </AlertDescription>
                </Alert>
              )
            : (
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Nouvel utilisateur</strong>
                    {' '}
                    - Cette personne doit d'abord créer un compte sur Yeko Pro.
                  </AlertDescription>
                </Alert>
              )}

          {/* OTP Section
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Code OTP à communiquer</h3>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expire dans 15 min
              </Badge>
            </div>

            <div className="flex items-center justify-between bg-background border rounded-lg p-4">
              <code className="text-2xl font-mono font-bold tracking-wider text-primary">
                {otp}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="ml-4"
              >
                {copied
                  ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Copié
                      </>
                    )
                  : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier
                      </>
                    )}
              </Button>
            </div>
          </div> */}

          {/* Instructions */}
          <div className="bg-background border rounded-lg p-4 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Prochaines étapes
            </h3>

            <div className="space-y-2 text-sm">
              {userExists
                ? (
                    <>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <p>L'utilisateur va recevoir l'email avec le code OTP</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <p>Il doit vous communiquer ce code OTP</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <p>Vous pourrez alors finaliser son ajout à l'école</p>
                      </div>
                    </>
                  )
                : (
                    <>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <p>L'utilisateur va recevoir l'email avec le code OTP</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <p>Il doit d'abord créer un compte sur Yeko Pro</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <p>Une fois connecté, il doit vous communiquer le code OTP</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                        <p>Vous pourrez alors finaliser son ajout à l'école</p>
                      </div>
                    </>
                  )}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${email}`} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Contacter par email
              </a>
            </Button>

            <Button onClick={onClose}>
              Compris
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
