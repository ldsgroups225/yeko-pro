// providers/UserProvider.tsx

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useInitUsefulData } from '@/hooks/useInitUsefullData' // Corrected import path if needed
import useUserStore from '@/store/userStore'
import { UserContext } from './UserContext'

interface UserProviderProps {
  children: ReactNode
}

interface State {
  isLoading: boolean
  isInitialized: boolean // Tracks if the initial load attempt has finished
  error: Error | null
}

type Action
  = | { type: 'START_LOADING' }
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

  // Prevent multiple initializations with a ref
  const initializationAttempted = useRef(false)

  // Memoize the initialization function to prevent unnecessary re-creations
  const stableInitialize = useCallback(async () => {
    if (initializationAttempted.current) {
      // Already attempted initialization, skip
      return
    }

    initializationAttempted.current = true
    // Starting initialization

    try {
      await initialize()
      // Initialization successful
      dispatch({ type: 'FINISH_LOADING' })
    }
    catch (err) {
      console.error('UserProvider: Initialization failed:', err)
      dispatch({ type: 'FINISH_LOADING', error: err as Error })
    }
    finally {
      // Mark as initialized regardless of success/failure to prevent re-running
      dispatch({ type: 'SET_INITIALIZED' })
    }
  }, [])

  useEffect(() => {
    // Run initialization only once on mount and if not already initialized
    if (!state.isInitialized && !initializationAttempted.current) {
      stableInitialize().catch(console.error)
    }

    return () => {
      // Cleanup function
    }
  }, [state.isInitialized]) // Include stableInitialize in dependencies

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
