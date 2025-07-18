'use client'

import { BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { notifyIndividualParent } from '@/services/accountingService'

interface Props {
  studentId: string
  studentName: string
  studentClassroom: string
}

export function NotifyIndividualParentButton({ studentId, studentName, studentClassroom }: Props) {
  const handleNotifyIndividualParent = async (): Promise<void> => {
    try {
      await notifyIndividualParent({ studentId, fullName: studentName, studentClassroom })
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
