// store/tuitionStore.ts

import type { InstallmentTemplate as ITemplate, TuitionSettings as ITuition } from '@/validations'
import { create } from 'zustand'
import { deleteInstallmentTemplate, getInstallmentTemplates, getTuitions, updateInstallmentTemplate, updateTuition } from '@/services'

// Define the state interface
/**
 * Interface defining the state of the tuition store.
 */
interface TuitionState {
  isLoading: boolean
  error: string | null
  tuitions: ITuition[]
  showAddTemplateModal: boolean
  installmentTemplates: ITemplate[]
}

// Define the actions interface
/**
 * Interface defining the actions available in the tuition store to manipulate the state.
 */
interface TuitionActions {
  /**
   * Updates an existing installment template or creates a new one if it doesn't exist for a specific grade.
   *
   * @param {Partial<ITemplate>} data - Partial data for the installment template to update or create.
   * @param {number} gradeId - The ID of the grade to which the installment template belongs.
   * @returns {Promise<ITemplate>} A promise that resolves to the updated or newly created installment template.
   * @throws {Error} If there is an error during the update or creation process.
   */
  updateInstallmentTemplate: (data: Partial<ITemplate>, id?: string) => Promise<ITemplate>

  /**
   * Updates existing tuition settings or creates new ones if they don't exist for a specific grade.
   *
   * @param {Partial<ITuition>} data - Partial data for the tuition settings to update or create.
   * @param {number} gradeId - The ID of the grade to which the tuition settings belong.
   * @returns {Promise<ITuition>} A promise that resolves to the updated or newly created tuition settings.
   * @throws {Error} If there is an error during the update or creation process.
   */
  updateTuitionSettings: (data: Partial<ITuition>, gradeId: number) => Promise<ITuition>

  /**
   * Fetches installment templates for a specific grade and updates the store.
   *
   * @param {number} gradeId - The ID of the grade for which to fetch installment templates.
   * @returns {Promise<void>} A promise that resolves when the installment templates are fetched and the store is updated.
   * @throws {Error} If there is an error during the fetching process.
   */
  fetchInstallmentTemplates: (gradeId: number) => Promise<void>

  /**
   * Sets the installment templates in the store. Typically used for direct state updates.
   *
   * @param {ITemplate[]} templates - An array of installment templates to set in the store.
   * @returns {void}
   */
  setInstallmentTemplates: (templates: ITemplate[]) => void

  /**
   * Sets the tuition settings in the store. Typically used for direct state updates.
   *
   * @param {ITuition[]} tuitions - An array of tuition settings to set in the store.
   * @returns {void}
   */
  setTuitions: (tuitions: ITuition[]) => void

  /**
   * Clears the installment templates array in the store and resets loading and error states related to installment templates.
   * @returns {void}
   */
  clearInstallmentTemplates: () => void

  /**
   * Fetches all tuition settings and updates the store.
   * @returns {Promise<void>} A promise that resolves when the tuition settings are fetched and the store is updated.
   * @throws {Error} If there is an error during the fetching process.
   */
  fetchTuitions: () => Promise<void>

  /**
   * Clears the tuitions array in the store and resets loading and error states related to tuitions.
   * @returns {void}
   */
  clearTuitions: () => void

  /**
   * Sets the showAddTemplateModal state.
   *
   * @param {boolean} show - The new value for showAddTemplateModal.
   * @returns {void}
   */
  setShowAddTemplateModal: (show: boolean) => void

  /**
   * Deletes an existing installment template.
   *
   * @param {string} id - The ID of the installment template to delete.
   * @returns {Promise<void>} A promise that resolves when the installment template is deleted and the store is updated.
   * @throws {Error} If there is an error during the deletion process.
   */
  deleteInstallmentTemplate: (id: string) => Promise<void>
}

/**
 * Zustand store for managing tuition settings and installment templates.
 *
 * Provides state and actions to fetch, update, and manage tuition related data.
 *
 * @returns {TuitionState & TuitionActions} The combined state and actions of the tuition store.
 */
const useTuitionStore = create<TuitionState & TuitionActions>((set, get) => ({
  tuitions: [],
  installmentTemplates: [],
  showAddTemplateModal: false,
  isLoading: false,
  error: null,

  // Actions
  /**
   * Action to set the tuitions array in the store.
   * @param {ITuition[]} tuitions - Array of tuition settings to set.
   */
  setTuitions: (tuitions: ITuition[]) => set({ tuitions, error: null }),

  /**
   * Action to fetch tuition settings and update the store.
   * Sets isLoading to true before fetching, and updates tuitions array and isLoading to false after successful fetch.
   * Sets error state if fetching fails.
   * @async
   * @throws {Error} If fetching tuitions fails.
   */
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

  /**
   * Action to update tuition settings for a specific grade.
   * Sends update request to the server and updates the tuition settings array in the store.
   * If tuition settings for the grade doesn't exist, it will add new one, otherwise it will update the existing one.
   * Sorts the tuitions array by gradeId after update.
   * @async
   * @param {Partial<ITuition>} data - Partial tuition data to update.
   * @param {number} gradeId - Grade ID for which tuition settings are being updated.
   * @returns {Promise<ITuition>} Promise resolving to the updated TuitionSettings object.
   * @throws {Error} If updating tuition settings fails.
   */
  updateTuitionSettings: async (data: Partial<ITuition>, gradeId: number): Promise<ITuition> => {
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

  /**
   * Action to set the installment templates array in the store.
   * @param {ITemplate[]} templates - Array of installment templates to set.
   */
  setInstallmentTemplates: (templates: ITemplate[]) => set({ installmentTemplates: templates }),

  /**
   * Action to fetch installment templates for a specific grade and update the store.
   * Sets isLoading to true before fetching, and updates installmentTemplates array and isLoading to false after successful fetch.
   * Sets error state if fetching fails.
   * @async
   * @param {number} gradeId - Grade ID for which installment templates are being fetched.
   * @throws {Error} If fetching installment templates fails.
   */
  fetchInstallmentTemplates: async (gradeId: number) => {
    set({ isLoading: true, error: null })

    try {
      const data = await getInstallmentTemplates(gradeId)
      set({ installmentTemplates: data, isLoading: false })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch installment templates'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  /**
   * Action to update an installment template for a specific grade.
   * Sends update request to the server and updates the installmentTemplates array in the store.
   * If installment template for the grade doesn't exist, it will add new one, otherwise it will update the existing one.
   * Sorts the installmentTemplates array by installmentNumber after update.
   * @async
   * @param {Partial<ITemplate>} data - Partial installment template data to update.
   * @param {string?} id - Installment template ID for which installment template is being updated.
   * @returns {Promise<ITemplate>} Promise resolving to the updated InstallmentTemplate object.
   * @throws {Error} If updating installment template fails.
   */
  updateInstallmentTemplate: async (data: Partial<ITemplate>, id?: string): Promise<ITemplate> => {
    set({ isLoading: true, error: null })

    try {
      // Assuming updateInstallmentTemplate is an async function that makes an API call
      const updatedTemplate: ITemplate = await updateInstallmentTemplate(data, id)

      const { installmentTemplates } = get()
      const oldTemplateIndex = installmentTemplates.findIndex(t => t.id === id)

      let templateArray: ITemplate[]

      if (oldTemplateIndex === -1) {
        // Create and sort
        templateArray = [...installmentTemplates, updatedTemplate].sort((a, b) => a.installmentNumber - b.installmentNumber)
      }
      else {
        // Update and sort
        templateArray = installmentTemplates.map((template, index) =>
          index === oldTemplateIndex ? updatedTemplate : template,
        ).sort((a, b) => a.installmentNumber - b.installmentNumber)
      }

      set({
        isLoading: false,
        error: null,
        installmentTemplates: templateArray,
      })
      return updatedTemplate
    }
    catch (error) {
      console.error('Error updating installment template:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update installment template'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  /**
   * Action to clear the installment templates array and reset related states.
   */
  clearInstallmentTemplates: () => set({ installmentTemplates: [], error: null, isLoading: false }),

  /**
   * Action to clear the tuitions array and reset related states.
   */
  clearTuitions: () => set({ tuitions: [], error: null, isLoading: false }),

  /**
   * Action to set the showAddTemplateModal state in the store.
   * @param {boolean} show - The new value for showAddTemplateModal.
   * @returns {void}
   */
  setShowAddTemplateModal: (show: boolean): void => set({ showAddTemplateModal: show }),

  /**
   * Action to delete an installment template.
   * Sends delete request to the server and updates the installmentTemplates array in the store.
   * @async
   * @param {string} id - Installment template ID for which installment template is being deleted.
   * @throws {Error} If deleting installment template fails.
   */
  deleteInstallmentTemplate: async (id: string): Promise<void> => {
    set({ isLoading: true, error: null })
    try {
      await deleteInstallmentTemplate(id)
      const { installmentTemplates } = get()
      const updatedTemplates = installmentTemplates.filter(template => template.id !== id)
      set({
        isLoading: false,
        error: null,
        installmentTemplates: updatedTemplates,
      })
    }
    catch (error) {
      console.error('Error deleting installment template:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete installment template'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },
}))

export default useTuitionStore
