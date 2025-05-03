// providers/UserProvider.tsx

import type { ReactNode } from 'react'
import { useInitUsefulData } from '@/hooks/useInitUsefullData' // Corrected import path if needed
import useUserStore from '@/store/userStore'
import { useEffect, useMemo, useReducer } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { UserContext } from './UserContext'

interface UserProviderProps {
  children: ReactNode
}

interface State {
  isLoading: boolean
  isInitialized: boolean // Tracks if the initial load attempt has finished
  error: Error | null
}

type Action =
  | { type: 'START_LOADING' }
  | { type: 'FINISH_LOADING', error?: Error }
  | { type: 'SET_INITIALIZED' }

const initialState: State = {
  isLoading: true, // Start loading initially
  isInitialized: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null }
    case 'FINISH_LOADING':
      return { ...state, isLoading: false, error: action.error || null }
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: true }
    default:
      return state
  }
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  // Get user state directly for the context value
  const user = useUserStore(useShallow(state => state.user))
  const { initialize } = useInitUsefulData()

  useEffect(() => {
    let isMounted = true // Flag to prevent state updates on unmounted component

    const loadInitialData = async () => {
      // console.log('UserProvider: useEffect triggered for initial load.')
      // No need to dispatch START_LOADING here, initialState handles it.

      try {
        await initialize() // Await the full initialization
        if (isMounted) {
          // console.log('UserProvider: Initialization successful.')
          dispatch({ type: 'FINISH_LOADING' })
        }
      }
      catch (err) {
        if (isMounted) {
          // console.error('UserProvider: Initialization failed.', err)
          dispatch({ type: 'FINISH_LOADING', error: err as Error })
        }
      }
      finally {
        if (isMounted) {
          // Mark as initialized regardless of success/failure to prevent re-running
          dispatch({ type: 'SET_INITIALIZED' })
          // console.log('UserProvider: Initialization attempt finished.')
        }
      }
    }

    // Run initialization only once on mount
    if (!state.isInitialized) {
      loadInitialData()
    }

    return () => {
      isMounted = false // Cleanup flag
    }
  }, [state.isInitialized]) // Depend only on initialize and isInitialized

  // Memoize the context value
  const contextValue = useMemo(() => ({
    ...state, // Includes isLoading, isInitialized, error
    user,
  }), [state, user])

  // Render null (or a loader) ONLY until the initial attempt is finished
  if (!state.isInitialized) {
    // console.log('UserProvider: Not initialized yet, rendering null.')
    return null // Or your global loading spinner
  }

  // Once initialized, render children. The children will react to
  // the user state from the context/store.
  // console.log('UserProvider: Initialized, rendering children. Loading:', state.isLoading)
  return (
    <UserContext value={contextValue}>
      {children}
    </UserContext>
  )
}
