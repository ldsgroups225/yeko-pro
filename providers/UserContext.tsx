import type { IUserProfileDTO } from '@/types'
import { createContext, useContext } from 'react'

interface UserContextState {
  user: IUserProfileDTO | null
  isLoading: boolean
  error: Error | null
  isInitialized: boolean
}

const UserContext = createContext<UserContextState | undefined>(undefined)

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}

export { UserContext }
