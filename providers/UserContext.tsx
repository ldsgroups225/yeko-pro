import type { IUserProfileDTO } from '@/types'
import { createContext } from 'react'

interface UserContextState {
  user: IUserProfileDTO | null
  isLoading: boolean
  error: Error | null
  isInitialized: boolean
}

const UserContext = createContext<UserContextState | undefined>(undefined)

export { UserContext }
