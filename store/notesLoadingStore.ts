import { create } from 'zustand'

interface NotesLoadingState {
  isLoading: boolean
  setLoading: (value: boolean) => void
}

export const useNotesLoadingStore = create<NotesLoadingState>(set => ({
  isLoading: false,
  setLoading: value => set({ isLoading: value }),
}))
