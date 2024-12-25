import type { IUserProfileDTO } from '@/types'
import { fetchUserProfile } from '@/services'
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
