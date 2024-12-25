import { useInitUsefulData } from '@/hooks/useInitUsefullData'
import { useUser } from '@/hooks/useUser'
import { type ReactNode, useCallback, useEffect, useReducer } from 'react'
import { UserContext } from './UserContext'

interface UserProviderProps {
  children: ReactNode
}

// Define the state type explicitly
interface State {
  isLoading: boolean
  isInitialized: boolean
  error: Error | null
}

// Define action types
type Action =
  | { type: 'START_LOADING' }
  | { type: 'FINISH_LOADING', error?: Error }
  | { type: 'SET_INITIALIZED' }

// Initial state with correct typing
const initialState: State = {
  isLoading: true,
  isInitialized: false,
  error: null,
}

// Reducer with proper type annotations
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
  const { user } = useUser()
  const { initialize } = useInitUsefulData()

  const initializeData = useCallback(async () => {
    if (state.isInitialized) {
      return
    }

    dispatch({ type: 'START_LOADING' })

    try {
      await initialize()
      dispatch({ type: 'FINISH_LOADING' })
    }
    catch (err) {
      dispatch({ type: 'FINISH_LOADING', error: err as Error })
    }
    finally {
      dispatch({ type: 'SET_INITIALIZED' })
    }
  }, [initialize, state.isInitialized])

  useEffect(() => {
    initializeData()
  }, [initializeData])

  return (
    <UserContext value={{ ...state, user }}>
      {children}
    </UserContext>
  )
}
