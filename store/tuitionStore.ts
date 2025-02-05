import type { TuitionSettings as ITuition } from '@/validations'
import { getTuitions, updateTuition } from '@/services'
import { create } from 'zustand'

// Define the state interface
interface TuitionState {
  tuitions: ITuition[]
  isLoading: boolean
  error: string | null
}

// Define the actions interface
interface TuitionActions {
  updateTuitionSettings: (data: Partial<ITuition>, gradeId: number) => Promise<ITuition>
  setTuitions: (tuitions: ITuition[]) => void
  fetchTuitions: () => Promise<void>
  clearTuitions: () => void
}

// Create the store with state and actions
const useTuitionStore = create<TuitionState & TuitionActions>((set, get) => ({
  tuitions: [],
  isLoading: false,
  error: null,

  // Actions
  setTuitions: tuitions => set({ tuitions, error: null }),

  fetchTuitions: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await getTuitions()
      set({ tuitions: data, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tuitions'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateTuitionSettings: async (data, gradeId) => {
    set({ isLoading: true, error: null })

    try {
      // Assuming updateTuition is an async function that makes an API call
      const updatedTuition: ITuition = await updateTuition(data, gradeId)

      const { tuitions } = get()
      const oldTuitionIndex = tuitions.findIndex(t => t.gradeId === gradeId)

      let tuitionArray: ITuition[]

      if (oldTuitionIndex === -1) {
        // Create and sort
        tuitionArray = [...tuitions, updatedTuition].sort((a, b) => a.gradeId - b.gradeId)
      }
      else {
        // Update and sort
        tuitionArray = tuitions.map((tuition, index) =>
          index === oldTuitionIndex ? updatedTuition : tuition,
        ).sort((a, b) => a.gradeId - b.gradeId)
      }

      set({
        isLoading: false,
        error: null,
        tuitions: tuitionArray,
      })
      return updatedTuition
    }
    catch (error) {
      console.error('Error updating tuition settings:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update tuition settings'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearTuitions: () => set({ tuitions: [], error: null, isLoading: false }),
}))

export default useTuitionStore
