import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useOptimistic, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

type SearchParamValue = string | boolean | number | undefined | null
type SearchParamsState = Record<string, SearchParamValue>

interface UseSearchParamsStateOptions<T extends SearchParamsState> {
  /**
   * Default values for the search params
   */
  defaultValues: T
  /**
   * Debounce delay in milliseconds for URL updates
   * @default 300
   */
  debounceDelay?: number
  /**
   * Whether to update the URL on every state change
   * @default true
   */
  updateURL?: boolean
}

export function useSearchParamsState<T extends SearchParamsState>({
  defaultValues,
  debounceDelay = 300,
  updateURL = true,
}: UseSearchParamsStateOptions<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Initialize state from URL or defaults
  const getInitialState = useCallback((): T => {
    const state = { ...defaultValues }
    
    searchParams.forEach((value, key) => {
      if (value === 'true') {
        state[key as keyof T] = true as T[keyof T]
      } else if (value === 'false') {
        state[key as keyof T] = false as T[keyof T]
      } else if (value === 'null') {
        state[key as keyof T] = null as unknown as T[keyof T]
      } else if (value === 'undefined') {
        state[key as keyof T] = undefined as unknown as T[keyof T]
      } else if (!Number.isNaN(Number(value))) {
        state[key as keyof T] = Number(value) as unknown as T[keyof T]
      } else {
        state[key as keyof T] = value as T[keyof T]
      }
    })
    
    return state as T
  }, [searchParams, defaultValues])

  // Optimistic state for instant UI updates
  const [optimisticState, setOptimisticState] = useOptimistic<T>(
    getInitialState()
  )

  // Create URL query string
  const createQueryString = useCallback((params: T) => {
    const newSearchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        newSearchParams.delete(key)
      } else {
        newSearchParams.set(key, String(value))
      }
    })

    return newSearchParams.toString()
  }, [])

  // Debounced URL update
  const updateURLDebounced = useDebouncedCallback((state: T) => {
    if (!updateURL) return
    
    const queryString = createQueryString(state)
    
    startTransition(() => {
      router.replace(`${pathname}?${queryString}`, { scroll: false })
    })
  }, debounceDelay)

  // Update state with optimistic updates
  const setState = useCallback((updater: T | ((prevState: T) => T)) => {
    const newState = typeof updater === 'function' 
      ? (updater as (prevState: T) => T)(optimisticState)
      : updater
    
    // Update URL with debounce
    updateURLDebounced(newState)
    setOptimisticState(newState)
  }, [updateURLDebounced, setOptimisticState, optimisticState])

  // Get current state
  const getState = useCallback((): T => ({
    ...optimisticState
  }), [optimisticState])

  // Reset to default values
  const reset = useCallback(() => {
    const newState = { ...defaultValues }
    updateURLDebounced(newState)
    setOptimisticState(newState)
  }, [defaultValues, updateURLDebounced, setOptimisticState])

  return {
    state: optimisticState,
    setState,
    getState,
    reset,
    isPending,
  }
}
