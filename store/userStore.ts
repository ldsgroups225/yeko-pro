import type { IUserProfileDTO } from '@/types'
import { create } from 'zustand'
import {
  fetchUserProfile,
  handleAuthCallback,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updatePassword,
} from '@/services'

// Define the state interface
interface UserState {
  isAuthenticated: boolean
  user: IUserProfileDTO | null
}

// Define the actions interface
interface UserActions {
  setUser: (user: IUserProfileDTO | null) => void
  getFullName: () => string
  fetchUser: () => Promise<IUserProfileDTO>
  signUp: (fullName: string, email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<{ success: boolean, error?: string, userId?: string }>
  signOut: () => Promise<void>
  handleAuthCallback: (code: string) => Promise<any>
  resetPassword: (email: string) => Promise<any>
  updatePassword: (newPassword: string) => Promise<any>
  clearUser: () => void
}

// Create the store with state and actions
const useUserStore = create<UserState & UserActions>((set, get) => ({
  isAuthenticated: false,
  user: null,

  // Actions
  setUser: user => set({ user }),
  getFullName: () => {
    const user = get().user
    return user ? `${user.firstName} ${user.lastName}` : ''
  },
  fetchUser: async () => {
    try {
      const profile = await fetchUserProfile()
      set({ user: profile, isAuthenticated: true })
      return profile
    }
    catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  },
  signUp: async (fullName, email, password) => {
    const result = await signUp(fullName, email, password)
    if (result.success) {
      // Optionally update state or perform other actions on success
    }
    return result
  },
  signIn: async (email, password) => {
    const result = await signIn(email, password)
    if (result.success) {
      try {
        // Fetch user profile (now supports all roles)
        await get().fetchUser()

        // Let middleware handle the redirect based on user role
        // No need to handle navigation here as middleware will detect the auth state
        // and redirect appropriately
      }
      catch (error) {
        console.error('Error during post-auth process:', error)
        // If there's an error fetching profile, let middleware handle the redirect
      }
    }
    return result
  },
  signOut: async () => {
    await signOut()
    get().clearUser()
  },
  handleAuthCallback: async (code) => {
    const result = await handleAuthCallback(code)
    if (result.success) {
      await get().fetchUser()
    }
    return result
  },
  resetPassword: async (email) => {
    return await resetPassword(email)
  },
  updatePassword: async (newPassword) => {
    return await updatePassword(newPassword)
  },
  clearUser: () => set({ isAuthenticated: false, user: null }),
}))

export default useUserStore
