import type { ISchoolYear, ISemester } from '@/types'
import { create } from 'zustand'
import { fetchSchoolYears, fetchSemesters } from '@/services'

interface SchoolYearState {
  isLoading: boolean
  error: string | null
  semesters: ISemester[]
  schoolYears: ISchoolYear[]
  selectedSchoolYearId: number
  activeSemester: ISemester | null
}

interface SchoolYearActions {
  clearSchoolYears: () => void
  fetchSchoolYears: () => Promise<void>
  setSchoolYears: (schoolYears: ISchoolYear[]) => void
  fetchSemesters: (schoolYearId: number) => Promise<void>
  setSelectedSchoolYearId: (schoolYearId: number) => void
  getSchoolYearById: (schoolYearId: number) => ISchoolYear | undefined
}

const useSchoolYearStore = create<SchoolYearState & SchoolYearActions>((set, get) => ({
  error: null,
  semesters: [],
  schoolYears: [],
  isLoading: false,
  activeSemester: null,
  selectedSchoolYearId: 0,

  setSchoolYears: schoolYears => set({ schoolYears, error: null }),

  setSelectedSchoolYearId: (schoolYearId) => {
    set({ selectedSchoolYearId: schoolYearId })
  },

  getSchoolYearById: (schoolYearId) => {
    const { schoolYears } = get()
    return schoolYears.find(schoolYear => schoolYear.id === schoolYearId)
  },

  fetchSchoolYears: async () => {
    // Avoid fetching if school years are already loaded
    const currentState = get()
    if (currentState.schoolYears.length > 0 && !currentState.error) {
      // School years already loaded, skip fetch
      return
    }

    // Fetching school years
    set({ isLoading: true, error: null })

    try {
      const data = await fetchSchoolYears()

      set({ schoolYears: data, isLoading: false })
      // School years fetched successfully

      if (data.length > 0)
        await get().fetchSemesters(data[0].id)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch schoolYears'
      console.error('SchoolYearStore: Error fetching school years:', errorMessage)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  fetchSemesters: async (schoolYearId: number) => {
    set({ isLoading: true, error: null })

    try {
      const data = await fetchSemesters(schoolYearId)

      set({ semesters: data, isLoading: false, selectedSchoolYearId: schoolYearId })

      if (data.length > 0) {
        const activeSemester = data.find(semester => semester.isCurrent)

        if (activeSemester)
          set({ activeSemester })
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch semesters'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearSchoolYears: () => set({ schoolYears: [], error: null, isLoading: false }),
}))

export default useSchoolYearStore
