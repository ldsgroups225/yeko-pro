import useUserStore from '@/store/userStore'

/**
 * Custom hook to interact with the user store with debounced fetch functionality.
 * Uses a 300ms debounce delay for rapid but controlled API calls.
 *
 * @returns {object} - An object containing user-related functions and data
 */
export function useUser() {
  const {
    isAuthenticated,
    user,
    setUser,
    getFullName,
    fetchUser,
  } = useUserStore()

  return {
    user,
    isAuthenticated,
    setUser,
    getFullName,
    fetchUser,
  }
}
