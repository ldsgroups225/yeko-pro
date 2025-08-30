// app/educator/hooks/useEducatorConduct.ts

import type { IConductQueryParams, IConductStats, IConductStudent } from '../types'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ReturnType {
  // State
  classes: { id: string, name: string }[]
  students: IConductStudent[]
  stats: IConductStats | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  filters: IConductQueryParams

  // Actions
  fetchStudents: (params?: IConductQueryParams) => Promise<void>
  fetchStats: () => Promise<void>
  fetchClassesForFilter: () => Promise<void>
  setFilters: (filters: Partial<IConductQueryParams>) => void
  setCurrentPage: (page: number) => void
  clearData: () => void
  refreshData: () => Promise<void>

  // Computed values
  hasStudents: boolean
  hasNoStudents: boolean
  totalPages: number
}

// Simple state management for educator conduct
let state = {
  classes: [] as { id: string, name: string }[],
  students: [] as IConductStudent[],
  stats: null as IConductStats | null,
  isLoading: false,
  error: null as string | null,
  totalCount: 0,
  currentPage: 1,
  filters: {} as IConductQueryParams,
}

let listeners: (() => void)[] = []

function notifyListeners() {
  listeners.forEach(listener => listener())
}

function setState(newState: Partial<typeof state>) {
  state = { ...state, ...newState }
  notifyListeners()
}

/**
 * Custom hook for managing educator conduct data and operations.
 * Provides access to conduct students, statistics, and related actions.
 */
export function useEducatorConduct(): ReturnType {
  const [, forceUpdate] = useState({})

  // Subscribe to state changes
  useEffect(() => {
    const listener = () => forceUpdate({})
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  /**
   * Stable version of fetchStudents with error handling
   */
  const fetchStudents = useCallback(async (params?: IConductQueryParams): Promise<void> => {
    try {
      setState({ isLoading: true, error: null })
      const { getEducatorConductStudents } = await import('../actions/conductService')
      const result = await getEducatorConductStudents(params || state.filters)
      setState({
        students: result.students,
        totalCount: result.totalCount,
        stats: result.stats,
        isLoading: false,
      })
    }
    catch (error) {
      console.error('Failed to fetch educator conduct students:', error)
      setState({
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des données',
        isLoading: false,
      })
      toast.error('Erreur lors du chargement des élèves')
    }
  }, [])

  /**
   * Stable version of fetchStats with error handling
   */
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const { getEducatorConductStats } = await import('../actions/conductService')
      const stats = await getEducatorConductStats()
      setState({ stats })
    }
    catch (error) {
      console.error('Failed to fetch educator conduct stats:', error)
      toast.error('Erreur lors du chargement des statistiques')
    }
  }, [])

  /**
   * Stable version of fetchClassesForFilter with error handling
   */
  const fetchClassesForFilter = useCallback(async (): Promise<void> => {
    try {
      const { getEducatorClassesForFilter } = await import('../actions/conductService')
      const classes = await getEducatorClassesForFilter()
      setState({ classes })
    }
    catch (error) {
      console.error('Failed to fetch educator classes for filter:', error)
      toast.error('Erreur lors du chargement des classes')
    }
  }, [])

  /**
   * Set filters and update state
   */
  const setFilters = useCallback((filters: Partial<IConductQueryParams>) => {
    setState({ filters: { ...state.filters, ...filters } })
  }, [])

  /**
   * Set current page
   */
  const setCurrentPage = useCallback((page: number) => {
    setState({ currentPage: page })
  }, [])

  /**
   * Clear all data
   */
  const clearData = useCallback(() => {
    setState({
      students: [],
      stats: null,
      classes: [],
      totalCount: 0,
      currentPage: 1,
      filters: {},
      error: null,
    })
  }, [])

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        fetchStudents(state.filters),
        fetchStats(),
        fetchClassesForFilter(),
      ])
    }
    catch (error) {
      console.error('Failed to refresh educator conduct data:', error)
      toast.error('Erreur lors du rafraîchissement des données')
    }
  }, [fetchStudents, fetchStats, fetchClassesForFilter])

  /**
   * Checks if there are any students loaded
   */
  const hasStudents = state.students.length > 0

  /**
   * Checks if there are no students loaded
   */
  const hasNoStudents = state.students.length === 0 && !state.isLoading

  /**
   * Calculates total pages for pagination
   */
  const totalPages = Math.ceil(state.totalCount / (state.filters.limit || 12))

  return {
    // State
    classes: state.classes,
    students: state.students,
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    filters: state.filters,

    // Actions
    fetchStudents,
    fetchStats,
    fetchClassesForFilter,
    setFilters,
    setCurrentPage,
    clearData,
    refreshData,

    // Computed values
    hasStudents,
    hasNoStudents,
    totalPages,
  }
}
