import type { IGrade } from '@/types'
import { fetchGrades } from '@/services'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Zustand store interface for managing grades data.
 */
interface GradeStore {
  grades: IGrade[]
  isLoading: boolean
  error: string | null
  setGrades: (grades: IGrade[]) => void
  getGradeById: (gradeId: number) => IGrade | undefined
  fetchGrades: (cycleId: string) => Promise<void>
  clearGrades: () => void
}

/**
 * Zustand store for managing grades data, with persistence.
 * The grades data is stored in localStorage to maintain the state across page reloads.
 */
const useGradeStore = create<GradeStore>()(
  persist(
    (set, get) => ({
      /**
       * Array of grades.
       */
      grades: [],

      /**
       * Loading state for async operations.
       */
      isLoading: false,

      /**
       * Error state for failed operations.
       */
      error: null,

      /**
       * Updates the grades array in the store.
       *
       * @param {IGrade[]} grades - Array of grade objects to set
       */
      setGrades: (grades: IGrade[]) => set({ grades, error: null }),

      /**
       * Retrieves a grade by its ID.
       *
       * @param {string} gradeId - The ID of the grade to retrieve
       * @returns {IGrade | undefined} The grade object if found, undefined otherwise
       */
      getGradeById: (gradeId: number) => {
        const { grades } = get()
        return grades.find(grade => grade.id === gradeId)
      },

      /**
       * Fetches grades for a specific cycle from the API and updates the store.
       *
       * @param {string} cycleId - The ID of the cycle to fetch grades for
       * @throws {Error} If the API request fails
       */
      fetchGrades: async (cycleId: string) => {
        set({ isLoading: true, error: null })

        try {
          const data = await fetchGrades(cycleId)
          set({
            grades: data,
            isLoading: false,
          })
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to fetch grades'

          set({
            error: errorMessage,
            isLoading: false,
          })

          throw error
        }
      },

      /**
       * Clears all grades data from the store.
       */
      clearGrades: () => set({
        grades: [],
        error: null,
        isLoading: false,
      }),
    }),
    {
      name: 'grades-storage',
      storage: createJSONStorage(() => localStorage),
      /**
       * Specify which parts of the state should be persisted
       */
      partialize: state => ({
        grades: state.grades,
      }),
    },
  ),
)

export default useGradeStore
