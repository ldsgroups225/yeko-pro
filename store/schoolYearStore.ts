import type { ISchoolYear } from '@/types'
import { fetchSchoolYears } from '@/services'
import { create } from 'zustand'

// Define the state interface
interface SchoolYearState {
  schoolYears: ISchoolYear[]
  isLoading: boolean
  error: string | null
  selectedSchoolYearId: number
}

// Define the actions interface
interface SchoolYearActions {
  setSchoolYears: (schoolYears: ISchoolYear[]) => void
  getSchoolYearById: (schoolYearId: number) => ISchoolYear | undefined
  fetchSchoolYears: () => Promise<void>
  clearSchoolYears: () => void
  setSelectedSchoolYearId: (schoolYearId: number) => void
}

// Create the store with state and actions
const useSchoolYearStore = create<SchoolYearState & SchoolYearActions>((set, get) => ({
  schoolYears: [],
  isLoading: false,
  error: null,
  selectedSchoolYearId: 0,

  // Actions
  setSchoolYears: schoolYears => set({ schoolYears, error: null }),

  setSelectedSchoolYearId: (schoolYearId) => {
    set({ selectedSchoolYearId: schoolYearId })
  },

  getSchoolYearById: (schoolYearId) => {
    const { schoolYears } = get()
    return schoolYears.find(schoolYear => schoolYear.id === schoolYearId)
  },

  fetchSchoolYears: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await fetchSchoolYears()
      set({ schoolYears: data, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch schoolYears'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearSchoolYears: () => set({ schoolYears: [], error: null, isLoading: false }),
}))

export default useSchoolYearStore
