import { create } from 'zustand'

interface TransactionsStore {
  isHistoricOpen: boolean
  isNewTransaction: boolean
  setNewTransaction: (open: boolean) => void
  setHistoricTransactionsOpen: (open: boolean) => void
}

export const useTransactionsStore = create<TransactionsStore>(set => ({
  isHistoricOpen: false,
  isNewTransaction: false,
  setNewTransaction: open => set({ isNewTransaction: open }),
  setHistoricTransactionsOpen: open => set({ isHistoricOpen: open }),
}))
