import type { IGrade } from '@/types'
import { create } from 'zustand'
import { fetchGrades } from '@/services'

// Define the state interface
interface GradeState {
  grades: IGrade[]
  isLoading: boolean
  error: string | null
}

// Define the actions interface
interface GradeActions {
  setGrades: (grades: IGrade[]) => void
  getGradeById: (gradeId: number) => IGrade | undefined
  fetchGrades: (cycleId: string) => Promise<void>
  clearGrades: () => void
}

// Create the store with state and actions
const useGradeStore = create<GradeState & GradeActions>((set, get) => ({
  grades: [],
  isLoading: false,
  error: null,

  // Actions
  setGrades: grades => set({ grades, error: null }),

  getGradeById: (gradeId) => {
    const { grades } = get()
    return grades.find(grade => grade.id === gradeId)
  },

  fetchGrades: async (cycleId) => {
    set({ isLoading: true, error: null })

    try {
      const data = await fetchGrades(cycleId)
      set({ grades: data, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch grades'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearGrades: () => set({ grades: [], error: null, isLoading: false }),
}))

export default useGradeStore
