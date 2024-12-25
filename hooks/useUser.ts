import useUserStore from '@/store/userStore'

/**
 * Custom hook to interact with the user store.
 *
 * @returns An object containing user-related functions and data with proper types.
 */
export function useUser() {
  const {
    isAuthenticated,
    user,
    setUser,
    getFullName,
    fetchUser,
    signUp,
    signIn,
    signOut,
    handleAuthCallback,
    resetPassword,
    updatePassword,
    clearUser,
  } = useUserStore()

  return {
    isAuthenticated,
    user,
    setUser,
    getFullName,
    fetchUser,
    signUp,
    signIn,
    signOut,
    handleAuthCallback,
    resetPassword,
    updatePassword,
    clearUser,
  } as const // Using 'as const' for precise type inference
}
