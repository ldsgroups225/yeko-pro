import { UserContext } from '@/providers/UserContext'
import { use } from 'react'

export function useUserContext() {
  const context = use(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
