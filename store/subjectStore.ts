import type { ISubject } from '@/types'
import { create } from 'zustand'
import { fetchSubjects } from '@/services'

// Define the state interface
interface SubjectState {
  subjects: ISubject[]
  isLoading: boolean
  error: string | null
}

// Define the actions interface
interface SubjectActions {
  setSubjects: (subjects: ISubject[]) => void
  getSubjectById: (subjectId: string) => ISubject | undefined
  fetchSubjects: () => Promise<void>
  clearSubjects: () => void
}

// Create the store with state and actions
const useSubjectStore = create<SubjectState & SubjectActions>((set, get) => ({
  subjects: [],
  isLoading: false,
  error: null,

  // Actions
  setSubjects: subjects => set({ subjects, error: null }),

  getSubjectById: (subjectId) => {
    const { subjects } = get()
    return subjects.find(subject => subject.id === subjectId)
  },

  fetchSubjects: async () => {
    set({ isLoading: true, error: null })

    try {
      const data = await fetchSubjects()
      set({ subjects: data, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subjects'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearSubjects: () => set({ subjects: [], error: null, isLoading: false }),
}))

export default useSubjectStore
