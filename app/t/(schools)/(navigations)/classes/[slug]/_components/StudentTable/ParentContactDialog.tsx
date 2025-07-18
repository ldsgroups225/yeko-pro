'use client'

import { Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getAvatarFromFullName } from '@/lib/utils'

interface Parent {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string | null
}

interface ParentContactDialogProps {
  isOpen: boolean
  onClose: () => void
  parent: Parent | null | undefined
  studentName: string
}

export function ParentContactDialog({ isOpen, onClose, parent, studentName }: ParentContactDialogProps) {
  if (!parent) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Parent non trouvé</DialogTitle>
            <DialogDescription>
              Aucun parent n'est lié à
              {' '}
              {studentName}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Contacter le parent de
            {' '}
            {studentName}
          </DialogTitle>
          <DialogDescription>
            Informations de contact pour
            {' '}
            {parent.fullName}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={parent.avatarUrl ?? ''} alt={parent.fullName} />
              <AvatarFallback className="text-xl">
                {getAvatarFromFullName(parent.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{parent.fullName}</h3>
              <p className="text-sm text-muted-foreground">Parent</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{parent.phone}</span>
              {/* <Button asChild variant="outline" size="sm" className="ml-auto">
                <a href={`tel:${parent.phone}`}>Appeler</a>
              </Button> */}
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{parent.email}</span>
              {/* <Button asChild variant="outline" size="sm" className="ml-auto">
                  <a href={`mailto:${parent.email}`}>Envoyer un email</a>
                </Button> */}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
