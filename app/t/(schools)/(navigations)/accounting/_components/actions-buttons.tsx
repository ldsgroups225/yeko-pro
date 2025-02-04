'use client'

import { Button } from '@/components/ui/button'
import { useTransactionsStore } from '@/store/transactionStore'
import { Bell, History, Plus } from 'lucide-react'
import { useState } from 'react'

export function ActionButtons() {
  const [isReminderEnabled, _setIsReminderEnabled] = useState(true) // TODO: Calculate based on reminder configuration
  const { setHistoricTransactionsOpen, setNewTransaction } = useTransactionsStore()

  const handleSendReminder = async () => {
    // TODO: Implement send reminder logic
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
