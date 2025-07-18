'use client'

import { Bell, History, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { notifyAllParents } from '@/services/accountingService'
import { useTransactionsStore } from '@/store/transactionStore'

export function ActionButtons() {
  const [isReminderEnabled, setIsReminderEnabled] = useState(true)
  const { setHistoricTransactionsOpen, setNewTransaction } = useTransactionsStore()

  const handleSendReminder = async () => {
    try {
      setIsReminderEnabled(false)
      const result = await notifyAllParents()

      switch (result.status) {
        case 'error':
          throw new Error(result.message)
        case 'warning':
          toast.warning(result.message)
          break
        case 'success':
          toast.success(result.message)
          break
      }
    }
    catch (error) {
      console.error(`Failed to notify individual parent: ${error}`)
      toast.error((error as Error).message)
    }
    finally {
      setIsReminderEnabled(true)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        onClick={() => setHistoricTransactionsOpen(true)}
        className="dark:text-black/80 dark:hover:text-accent-foreground"
      >
        <History className="mr-2 h-4 w-4" />
        Historique
      </Button>

      <Button
        onClick={() => setNewTransaction(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Nouveau Paiement
      </Button>

      <Button
        variant="secondary"
        disabled={!isReminderEnabled}
        onClick={handleSendReminder}
      >
        <Bell className="mr-2 h-4 w-4" />
        Envoyer un Rappel
      </Button>
    </div>
  )
}
