import { use } from 'react'
import { UserContext } from '@/providers/UserContext'

export function useUserContext() {
  const context = use(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
