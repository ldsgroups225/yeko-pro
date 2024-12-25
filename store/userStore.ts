import type { IUserProfileDTO } from '@/types'
import {
  fetchUserProfile,
  handleAuthCallback,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '@/services'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Zustand store interface for managing user data.
 */
interface UserStore {
  isAuthenticated: boolean
  user: IUserProfileDTO | null
  setUser: (user: IUserProfileDTO | null) => void
  getFullName: () => string
  fetchUser: () => Promise<IUserProfileDTO>
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  handleAuthCallback: (code: string) => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
  clearUser: () => void
}

/**
 * Zustand store for managing the user data, with persistence.
 * The user data is stored in localStorage to maintain the session across page reloads.
 *
 * @returns {UserStore} Zustand store for managing user state.
 */
const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      /**
       * Returns whether the user is authenticated.
       *
       * @type {boolean}
       */
      isAuthenticated: false,
      user: null,
      /**
       * Updates the current user in the store.
       *
       * @param {IUserProfileDTO | null} user - The user object to set, or null to clear the user.
       */
      setUser: (user: IUserProfileDTO | null) => set({ user }),
      /**
       * Retrieves the full name of the user.
       *
       * @returns {string} - The user's full name as "firstName lastName" or an empty string if no user is set.
       */
      getFullName: (): string => {
        const user = get().user
        return user ? `${user.firstName} ${user.lastName}` : ''
      },
      /**
       * Fetches the user's profile from the API and updates the user state.
       *
       * @returns {Promise<IUserProfileDTO>} - A Promise that resolves once the user profile has been fetched and stored.
       */
      fetchUser: async (): Promise<IUserProfileDTO> => {
        try {
          const profile = await fetchUserProfile()
          set({ user: profile })
          set({ isAuthenticated: true })
          return profile
        }
        catch (error) {
          console.error('Error fetching user profile:', error)
          throw error
        }
      },
      /**
       * Signs up a new user.
       *
       * @param {string} email - User's email address.
       * @param {string} password - User's password.
       * @returns {Promise<any>} - A Promise that resolves with the result of the sign-up operation.
       */
      signUp: async (email: string, password: string): Promise<any> => {
        const result = await signUp(email, password)
        if (result.success) {
          // Optionally update state or perform other actions on success
        }
        return result
      },
      /**
       * Signs in an existing user.
       *
       * @param {string} email - User's email address.
       * @param {string} password - User's password.
       * @returns {Promise<any>} - A Promise that resolves with the result of the sign-in operation.
       */
      signIn: async (email: string, password: string): Promise<any> => {
        const result = await signIn(email, password)
        if (result.success) {
          await get().fetchUser()
        }
        return result
      },
      /**
       * Signs out the current user.
       *
       * @returns {Promise<void>} - A Promise that resolves when the sign-out operation is complete.
       */
      signOut: async (): Promise<void> => {
        await signOut()
        get().clearUser()
      },
      /**
       * Handles the OAuth callback.
       *
       * @param {string} code - The authorization code from the OAuth provider.
       * @returns {Promise<any>} - A Promise that resolves with the result of the OAuth callback handling.
       */
      handleAuthCallback: async (code: string): Promise<any> => {
        const result = await handleAuthCallback(code)
        if (result.success) {
          await get().fetchUser()
        }
        return result
      },
      /**
       * Resets the user's password.
       *
       * @param {string} email - Email address of the user.
       * @returns {Promise<any>} - A Promise that resolves with the result of the password reset operation.
       */
      resetPassword: async (email: string): Promise<any> => {
        return await resetPassword(email)
      },
      /**
       * Updates the user's password.
       *
       * @param {string} newPassword - New password to set.
       * @returns {Promise<any>} - A Promise that resolves with the result of the password update operation.
       */
      updatePassword: async (newPassword: string): Promise<any> => {
        return await updatePassword(newPassword)
      },
      /**
       * Clear the data from the store.
       *
       * @returns {void}
       */
      clearUser: () => set({
        isAuthenticated: false,
        user: null,
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useUserStore
