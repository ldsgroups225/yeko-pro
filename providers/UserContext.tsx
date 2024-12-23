import type { IUserProfileDTO } from '@/types'
import { useInitUsefullData } from '@/hooks/useInitUsefullData'
import { createContext, useContext, useEffect, useState } from 'react'

interface UserContextType {
  user: IUserProfileDTO | null
  isLoading: boolean
  error: Error | null
}

// Create the UserContext
const UserContext = createContext<UserContextType | undefined>(undefined)

// Export the useUserContext hook
export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}

// Export the UserContext object
export { UserContext }
