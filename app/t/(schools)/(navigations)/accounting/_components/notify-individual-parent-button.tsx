'use client'

import { useUser } from '@/hooks'
import { notifyIndividualParent } from '@/services/accountingService'
import { BellRing } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  studentId: string
  studentName: string
  studentClassroom: string
}

export function NotifyIndividualParentButton({ studentId, studentName, studentClassroom }: Props) {
  const { user } = useUser()

  const handleNotifyIndividualParent = async (): Promise<void> => {
    try {
      if (!user) {
        toast.error('Vous devez être connecté pour envoyer une notification.')
        return
      }

      await notifyIndividualParent({ studentId, schoolName: user!.school.name, fullName: studentName, studentClassroom })
      toast.success('Notification envoyée avec succès.')
    }
    catch (error) {
      console.error(`Failed to notify individual parent: ${error}`)
      toast.error('Une erreur est survenue lors de la notification du parent.')
    }
  }

  return (
    <button
      type="button"
      className="p-1 border border-border rounded group"
      onClick={() => handleNotifyIndividualParent()}
    >
      <BellRing className="h-4 w-4 transform-origin-top group-hover:animate-ring" />
    </button>
  )
}
