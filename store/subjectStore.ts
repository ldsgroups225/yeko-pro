import type { ISubject } from '@/types'
import { create } from 'zustand'
import { fetchSchoolSubjectIds, fetchSubjects, saveSchoolSubjects, saveSchoolSubjectsForYear } from '@/services/initializeDataService'

// Define the state interface
interface SubjectState {
  subjects: ISubject[]
  isLoading: boolean
  error: string | null
  selectedSubjectIds: string[]
}

// Define the actions interface
interface SubjectActions {
  setSubjects: (subjects: ISubject[]) => void
  getSubjectById: (subjectId: string) => ISubject | undefined
  fetchSubjects: () => Promise<void>
  clearSubjects: () => void
  setSelectedSubjects: (ids: string[]) => void
  loadSchoolSubjects: (schoolId: string) => Promise<void>
  saveSelectedSubjects: (schoolId: string) => Promise<void>
  loadSchoolSubjectsForYear: (schoolId: string, schoolYearId: number) => Promise<void>
  saveSelectedSubjectsForYear: (schoolId: string, schoolYearId: number) => Promise<void>
}

// Create the store with state and actions
const useSubjectStore = create<SubjectState & SubjectActions>((set, get) => ({
  subjects: [],
  isLoading: false,
  error: null,
  selectedSubjectIds: [],

  // Actions
  setSubjects: subjects => set({ subjects, error: null }),

  getSubjectById: (subjectId) => {
    const { subjects } = get()
    return subjects.find(subject => subject.id === subjectId)
  },

  fetchSubjects: async () => {
    // Avoid fetching if subjects are already loaded
    const currentState = get()
    if (currentState.subjects.length > 0 && !currentState.error) {
      // Subjects already loaded, skip fetch
      return
    }

    // Fetching subjects
    set({ isLoading: true, error: null })

    try {
      const data = await fetchSubjects()
      set({ subjects: data, isLoading: false })
      // Subjects fetched successfully
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subjects'
      console.error('SubjectStore: Error fetching subjects:', errorMessage)
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  clearSubjects: () => set({ subjects: [], error: null, isLoading: false }),
  setSelectedSubjects: ids => set({ selectedSubjectIds: ids }),

  loadSchoolSubjects: async (_schoolId) => {
    // This function is deprecated - use loadSchoolSubjectsForYear instead
    console.warn('loadSchoolSubjects is deprecated - use loadSchoolSubjectsForYear instead')
    set({ isLoading: true, error: null })

    try {
      // For backward compatibility, we'll try to get the current school year
      // However, this function should ideally be removed and replaced with loadSchoolSubjectsForYear
      set({ selectedSubjectIds: [], isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load school subjects'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  saveSelectedSubjects: async (schoolId) => {
    try {
      const { selectedSubjectIds } = get()
      await saveSchoolSubjects(schoolId, selectedSubjectIds)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save school subjects'
      set({ error: errorMessage })
      throw error
    }
  },

  loadSchoolSubjectsForYear: async (schoolId, schoolYearId) => {
    set({ isLoading: true, error: null })

    try {
      const ids = await fetchSchoolSubjectIds(schoolId, schoolYearId)
      set({ selectedSubjectIds: ids, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load school subjects for year'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  saveSelectedSubjectsForYear: async (schoolId, schoolYearId) => {
    try {
      const { selectedSubjectIds } = get()
      await saveSchoolSubjectsForYear(schoolId, schoolYearId, selectedSubjectIds)
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save school subjects for year'
      set({ error: errorMessage })
      throw error
    }
  },
}))

export default useSubjectStore
