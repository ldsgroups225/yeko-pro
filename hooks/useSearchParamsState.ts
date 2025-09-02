import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useOptimistic, useRef, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

/**
 * Supported search parameter value types
 */
type SearchParamValue = string | boolean | number | undefined | null

/**
 * Generic type for search parameters state object
 */
type SearchParamsState = Record<string, SearchParamValue>

/**
 * Custom serializers for complex data types that need special handling in URLs
 * @template T - The search parameters state type
 */
type SerializerMap<T> = {
  [K in keyof T]?: {
    /** Convert the value to a string for URL storage */
    serialize: (value: T[K]) => string
    /** Convert the string back to the original value type */
    deserialize: (value: string) => T[K]
  }
}

/**
 * Configuration options for the useSearchParamsState hook
 * @template T - The search parameters state type
 */
interface UseSearchParamsStateOptions<T extends SearchParamsState> {
  /**
   * Default values for the search params. These are used as fallbacks
   * when no URL parameters are present or when resetting state.
   * @example
   * ```typescript
   * defaultValues: {
   *   page: 1,
   *   search: '',
   *   category: 'all',
   *   sortBy: 'name'
   * }
   * ```
   */
  defaultValues: T

  /**
   * Debounce delay in milliseconds for URL updates.
   * Prevents excessive URL changes during rapid state updates.
   * @default 300
   * @example
   * ```typescript
   * debounceDelay: 500 // Wait 500ms before updating URL
   * ```
   */
  debounceDelay?: number

  /**
   * Whether to update the URL on every state change.
   * Set to false for read-only or temporary state management.
   * @default true
   * @example
   * ```typescript
   * updateURL: false // Don't sync state to URL
   * ```
   */
  updateURL?: boolean

  /**
   * Custom serializers for complex data types like arrays or objects.
   * Use when you need to store non-primitive values in URL parameters.
   * @example
   * ```typescript
   * serializers: {
   *   filters: {
   *     serialize: (filters) => JSON.stringify(filters),
   *     deserialize: (str) => JSON.parse(str)
   *   },
   *   dateRange: {
   *     serialize: (range) => `${range.start.toISOString()},${range.end.toISOString()}`,
   *     deserialize: (str) => {
   *       const [start, end] = str.split(',')
   *       return { start: new Date(start), end: new Date(end) }
   *     }
   *   }
   * }
   * ```
   */
  serializers?: SerializerMap<T>

  /**
   * Values to exclude from URL (will be removed from search params).
   * Useful for keeping URLs clean by omitting default or empty values.
   * @default ['', 'all', undefined, null]
   * @example
   * ```typescript
   * excludeFromURL: ['', 'all', 0, false] // Don't show these values in URL
   * ```
   */
  excludeFromURL?: SearchParamValue[]

  /**
   * Whether to sync state when search params change externally.
   * Useful when multiple components share the same URL parameters.
   * @default true
   * @example
   * ```typescript
   * syncOnParamsChange: false // Don't sync when URL changes externally
   * ```
   */
  syncOnParamsChange?: boolean

  /**
   * Callback fired when state changes, either from internal updates or external URL changes.
   * Useful for analytics, logging, or triggering side effects.
   * @param newState - The new state after the change
   * @param prevState - The previous state before the change
   * @example
   * ```typescript
   * onStateChange: (newState, prevState) => {
   *   console.log('Search params changed:', { from: prevState, to: newState })
   *   analytics.track('search_params_changed', newState)
   * }
   * ```
   */
  onStateChange?: (newState: T, prevState: T) => void
}

/**
 * A comprehensive React hook for managing URL search parameters with optimistic updates,
 * TypeScript support, and advanced features like custom serialization and debouncing.
 *
 * Features:
 * - 🔄 Optimistic updates for instant UI feedback
 * - ⏱️ Debounced URL updates to prevent excessive navigation
 * - 🎯 TypeScript-first with full type inference
 * - 📦 Custom serializers for complex data types
 * - 🔄 Bidirectional sync between state and URL
 * - ⚡ Performance optimized with minimal re-renders
 *
 * @template T - The shape of your search parameters state
 * @param options - Configuration options for the hook
 * @param options.defaultValues - Default values for the search parameters state
 * @param options.debounceDelay - Delay in milliseconds for debouncing URL updates (default: 300)
 * @param options.updateURL - Whether to update the URL with state changes (default: true)
 * @param options.serializers - Custom serializers for converting values to/from URL strings
 * @param options.excludeFromURL - Values to exclude from URL when they match these values
 * @param options.syncOnParamsChange - Whether to sync state when URL params change (default: true)
 * @param options.onStateChange - Callback function called when state changes
 * @returns An object with state management utilities
 *
 * @example
 * Basic usage with simple search parameters:
 * ```typescript
 * const { state, setState, setStateKey } = useSearchParamsState({
 *   defaultValues: {
 *     page: 1,
 *     search: '',
 *     category: 'all'
 *   }
 * })
 *
 * // Update individual key
 * setStateKey('page', 2)
 *
 * // Update multiple keys
 * setState({ page: 1, search: 'react' })
 * ```
 *
 * @example
 * Advanced usage with custom serializers:
 * ```typescript
 * interface FilterState {
 *   tags: string[]
 *   dateRange: { start: Date; end: Date }
 *   priceRange: { min: number; max: number }
 * }
 *
 * const { state, setState, batchSetState } = useSearchParamsState<FilterState>({
 *   defaultValues: {
 *     tags: [],
 *     dateRange: { start: new Date(), end: new Date() },
 *     priceRange: { min: 0, max: 1000 }
 *   },
 *   serializers: {
 *     tags: {
 *       serialize: (tags) => tags.join(','),
 *       deserialize: (str) => str ? str.split(',') : []
 *     },
 *     dateRange: {
 *       serialize: (range) => `${range.start.toISOString()}-${range.end.toISOString()}`,
 *       deserialize: (str) => {
 *         const [start, end] = str.split('-')
 *         return { start: new Date(start), end: new Date(end) }
 *       }
 *     },
 *     priceRange: {
 *       serialize: (range) => `${range.min}-${range.max}`,
 *       deserialize: (str) => {
 *         const [min, max] = str.split('-').map(Number)
 *         return { min, max }
 *       }
 *     }
 *   },
 *   onStateChange: (newState, prevState) => {
 *     console.log('Filters changed:', newState)
 *   }
 * })
 * ```
 *
 * @example
 * E-commerce product filtering:
 * ```typescript
 * const ProductFilters = () => {
 *   const { state, setStateKey, reset, clearKeys } = useSearchParamsState({
 *     defaultValues: {
 *       category: 'all',
 *       brand: '',
 *       minPrice: 0,
 *       maxPrice: 1000,
 *       inStock: false,
 *       sortBy: 'name',
 *       page: 1
 *     },
 *     debounceDelay: 500,
 *     excludeFromURL: ['all', '', 0, false]
 *   })
 *
 *   return (
 *     <div>
 *       <select
 *         value={state.category}
 *         onChange={(e) => setStateKey('category', e.target.value)}
 *       >
 *         <option value="all">All Categories</option>
 *         <option value="electronics">Electronics</option>
 *       </select>
 *
 *       <input
 *         value={state.minPrice}
 *         onChange={(e) => setStateKey('minPrice', Number(e.target.value))}
 *         type="number"
 *         placeholder="Min Price"
 *       />
 *
 *       <button onClick={() => clearKeys('minPrice', 'maxPrice')}>
 *         Clear Price Filter
 *       </button>
 *
 *       <button onClick={reset}>
 *         Reset All Filters
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useSearchParamsState<T extends SearchParamsState>({
  defaultValues,
  debounceDelay = 300,
  updateURL = true,
  serializers = {},
  excludeFromURL = ['', 'all', undefined, null],
  syncOnParamsChange = true,
  onStateChange,
}: UseSearchParamsStateOptions<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const prevStateRef = useRef<T>(defaultValues)

  /**
   * Parse URL parameter value to appropriate JavaScript type.
   * Handles custom serializers and built-in type conversion.
   * @private
   */
  const parseValue = useCallback((key: string, value: string): SearchParamValue => {
    const serializer = serializers[key as keyof T]
    if (serializer) {
      try {
        return serializer.deserialize(value)
      }
      catch (error) {
        console.warn(`Failed to deserialize value for key "${key}":`, error)
        return defaultValues[key as keyof T]
      }
    }

    // Default parsing logic
    if (value === 'true')
      return true
    if (value === 'false')
      return false
    if (value === 'null')
      return null
    if (value === 'undefined')
      return undefined

    // Try to parse as number
    const numValue = Number(value)
    if (!Number.isNaN(numValue) && value.trim() !== '') {
      return numValue
    }

    return value
  }, [serializers, defaultValues])

  /**
   * Initialize state from current URL parameters or fallback to defaults.
   * Safely handles parsing errors and invalid values.
   * @private
   */
  const getInitialState = useCallback((): T => {
    const state = { ...defaultValues }

    try {
      searchParams.forEach((value, key) => {
        if (key in defaultValues) {
          state[key as keyof T] = parseValue(key, value) as T[keyof T]
        }
      })
    }
    catch (error) {
      console.warn('Error parsing search params:', error)
    }

    return state
  }, [searchParams, defaultValues, parseValue])

  /**
   * Optimistic state for instant UI updates while URL changes are pending.
   * Provides immediate feedback to users before navigation completes.
   * @private
   */
  const [optimisticState, setOptimistic] = useOptimistic<T>(
    getInitialState(),
  )

  function setOptimisticState(state: T) {
    startTransition(() => setOptimistic(state))
  }

  /**
   * Convert JavaScript value to URL-safe string using custom or default serialization.
   * @private
   */
  const serializeValue = useCallback((key: string, value: SearchParamValue): string => {
    const serializer = serializers[key as keyof T]
    if (serializer) {
      try {
        return serializer.serialize(value as T[keyof T])
      }
      catch (error) {
        console.warn(`Failed to serialize value for key "${key}":`, error)
        return String(value)
      }
    }

    return String(value)
  }, [serializers])

  /**
   * Create URL query string from state object, excluding specified values.
   * @private
   */
  const createQueryString = useCallback((params: T) => {
    const newSearchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (excludeFromURL.includes(value)) {
        newSearchParams.delete(key)
      }
      else {
        const serializedValue = serializeValue(key, value)
        newSearchParams.set(key, serializedValue)
      }
    })

    return newSearchParams.toString()
  }, [excludeFromURL, serializeValue])

  /**
   * Debounced URL update function to prevent excessive navigation events.
   * @private
   */
  const updateURLDebounced = useDebouncedCallback((state: T) => {
    if (!updateURL)
      return

    try {
      const queryString = createQueryString(state)
      const newURL = queryString ? `${pathname}?${queryString}` : pathname

      startTransition(() => {
        router.replace(newURL, { scroll: false })
      })
    }
    catch (error) {
      console.warn('Error updating URL:', error)
    }
  }, debounceDelay)

  /**
   * Update the entire state with a new value or updater function.
   * Supports optimistic updates and triggers URL changes.
   *
   * @param updater - New state object or function that receives current state
   *
   * @example
   * ```typescript
   * // Set entire state
   * setState({ page: 1, search: 'react', category: 'tutorials' })
   *
   * // Update with function
   * setState(prev => ({ ...prev, page: prev.page + 1 }))
   * ```
   */
  const setState = useCallback((updater: T | ((prevState: T) => T)) => {
    const prevState = optimisticState
    const newState = typeof updater === 'function'
      ? (updater as (prevState: T) => T)(optimisticState)
      : updater

    // Call onChange callback
    onStateChange?.(newState, prevState)

    // Update URL with debounce
    updateURLDebounced(newState)
    setOptimisticState(newState)

    // Store previous state for comparison
    prevStateRef.current = prevState
  }, [updateURLDebounced, setOptimisticState, optimisticState, onStateChange])

  /**
   * Update a specific key in the state.
   * More efficient than updating entire state for single value changes.
   *
   * @param key - The state key to update
   * @param value - New value or updater function for that key
   *
   * @example
   * ```typescript
   * // Set specific value
   * setStateKey('page', 2)
   *
   * // Update with function
   * setStateKey('page', prev => prev + 1)
   * ```
   */
  const setStateKey = useCallback(<K extends keyof T>(
    key: K,
    value: T[K] | ((prevValue: T[K]) => T[K]),
  ) => {
    setState(prevState => ({
      ...prevState,
      [key]: typeof value === 'function' ? (value as (prevValue: T[K]) => T[K])(prevState[key]) : value,
    }))
  }, [setState])

  /**
   * Get a copy of the current state.
   * Returns a new object to prevent accidental mutations.
   *
   * @returns Current state object
   *
   * @example
   * ```typescript
   * const currentState = getState()
   * console.log('Current page:', currentState.page)
   * ```
   */
  const getState = useCallback((): T => ({ ...optimisticState }), [optimisticState])

  /**
   * Reset all state values to their defaults and update the URL.
   * Useful for "Clear All" functionality.
   *
   * @example
   * ```typescript
   * <button onClick={reset}>Clear All Filters</button>
   * ```
   */
  const reset = useCallback(() => {
    const newState = { ...defaultValues }
    const prevState = optimisticState

    onStateChange?.(newState, prevState)
    updateURLDebounced(newState)
    setOptimisticState(newState)
    prevStateRef.current = prevState
  }, [defaultValues, updateURLDebounced, setOptimisticState, optimisticState, onStateChange])

  /**
   * Sync state when search params change externally.
   * Handles browser back/forward navigation and direct URL changes.
   * @private
   */
  useEffect(() => {
    if (!syncOnParamsChange)
      return

    const newState = getInitialState()
    const currentState = optimisticState

    // Check if state actually changed
    const hasChanged = Object.keys({ ...newState, ...currentState }).some(
      key => newState[key as keyof T] !== currentState[key as keyof T],
    )

    if (hasChanged) {
      onStateChange?.(newState, currentState)
      setOptimisticState(newState)
      prevStateRef.current = currentState
    }
  }, [searchParams, syncOnParamsChange, getInitialState, optimisticState, onStateChange, setOptimisticState])

  /**
   * Get the previous state value before the last change.
   * Useful for comparing changes or implementing undo functionality.
   *
   * @returns Previous state object or undefined if no previous state
   *
   * @example
   * ```typescript
   * const prevState = getPrevState()
   * if (prevState && prevState.page !== state.page) {
   *   console.log(`Page changed from ${prevState.page} to ${state.page}`)
   * }
   * ```
   */
  const getPrevState = useCallback((): T | undefined =>
    prevStateRef.current ? { ...prevStateRef.current } : undefined, [])

  /**
   * Update multiple state keys at once in a single operation.
   * More efficient than multiple setState calls.
   *
   * @param updates - Partial state object with keys to update
   *
   * @example
   * ```typescript
   * batchSetState({
   *   page: 1,
   *   search: '',
   *   category: 'all'
   * })
   * ```
   */
  const batchSetState = useCallback((updates: Partial<T>) => {
    setState(prevState => ({ ...prevState, ...updates }))
  }, [setState])

  /**
   * Reset specific keys to their default values while keeping others unchanged.
   * Useful for partial form resets or clearing specific filters.
   *
   * @param keys - Array of keys to reset to default values
   *
   * @example
   * ```typescript
   * // Clear only price-related filters
   * clearKeys('minPrice', 'maxPrice')
   *
   * // Clear search and reset to first page
   * clearKeys('search', 'page')
   * ```
   */
  const clearKeys = useCallback((...keys: (keyof T)[]) => {
    setState((prevState) => {
      const newState = { ...prevState }
      keys.forEach((key) => {
        newState[key] = defaultValues[key]
      })
      return newState
    })
  }, [setState, defaultValues])

  return {
    /**
     * Current state object with all search parameter values
     */
    state: optimisticState,

    /**
     * Update the entire state with a new value or updater function
     */
    setState,

    /**
     * Update a specific key in the state
     */
    setStateKey,

    /**
     * Get a copy of the current state
     */
    getState,

    /**
     * Get the previous state value before the last change
     */
    getPrevState,

    /**
     * Reset all state values to their defaults
     */
    reset,

    /**
     * Update multiple state keys at once
     */
    batchSetState,

    /**
     * Reset specific keys to their default values
     */
    clearKeys,

    /**
     * Whether a URL update is currently pending (useful for loading states)
     */
    isPending,
  } as const
}
