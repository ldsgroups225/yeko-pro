import { useInitUsefullData } from '@/hooks/useInitUsefullData'
import { useUser } from '@/hooks/useUser'
import { type ReactNode, useEffect, useState } from 'react'
import { UserContext } from './UserContext'

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useUser()

  const { initialize } = useInitUsefullData()

  useEffect(() => {
    const fetchData = async () => {
      if (isInitialized)
        return

      try {
        setIsLoading(true)
        await initialize()
      }
      catch (err) {
        setError(err as Error)
      }
      finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    fetchData()
  }, [initialize])

  return (
    <UserContext value={{ user, isLoading, error }}>
      {children}
    </UserContext>
  )
}
