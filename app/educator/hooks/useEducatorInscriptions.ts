// app/educator/hooks/useEducatorInscriptions.ts

'use client'

import type {
  IClass,
  IGrade,
  IInscriptionQueryParams,
  IInscriptionRecord,
  IInscriptionStats,
} from '../types/inscription'
import { useCallback, useEffect, useState } from 'react'
import {
  getEducatorClasses,
  getEducatorGrades,
  getEducatorInscriptions,
  getEducatorInscriptionStats,
} from '../actions/inscriptionService'

interface ReturnType {
  // State
  inscriptions: IInscriptionRecord[]
  stats: IInscriptionStats | null
  grades: IGrade[]
  classes: IClass[]
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  filters: IInscriptionQueryParams

  // Actions
  fetchInscriptions: (params?: IInscriptionQueryParams) => Promise<void>
  fetchStats: () => Promise<void>
  fetchGrades: () => Promise<void>
  fetchClasses: () => Promise<void>
  setFilters: (filters: Partial<IInscriptionQueryParams>) => void
  setCurrentPage: (page: number) => void
  clearData: () => void
  refreshData: () => Promise<void>

  // Computed values
  hasInscriptions: boolean
  hasNoInscriptions: boolean
  totalPages: number
}

// Global state management similar to conduct hook
const state = {
  inscriptions: [] as IInscriptionRecord[],
  stats: null as IInscriptionStats | null,
  grades: [] as IGrade[],
  classes: [] as IClass[],
  isLoading: false,
  error: null as string | null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  filters: {} as IInscriptionQueryParams,
}

const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach(listener => listener())
}

function setState(newState: Partial<typeof state>) {
  Object.assign(state, newState)
  notifyListeners()
}

export function useEducatorInscriptions(): ReturnType {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const fetchInscriptions = useCallback(async (params: IInscriptionQueryParams = {}) => {
    try {
      setState({ isLoading: true, error: null })

      const mergedParams = { ...state.filters, ...params }
      const response = await getEducatorInscriptions(mergedParams)

      setState({
        inscriptions: response.inscriptions,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        filters: mergedParams,
        isLoading: false,
      })
    }
    catch (error) {
      console.error('Error fetching inscriptions:', error)
      setState({
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des inscriptions',
        isLoading: false,
      })
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      setState({ error: null })
      const stats = await getEducatorInscriptionStats()
      setState({ stats })
    }
    catch (error) {
      console.error('Error fetching inscription stats:', error)
      setState({
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques',
      })
    }
  }, [])

  const fetchGrades = useCallback(async () => {
    try {
      setState({ error: null })
      const grades = await getEducatorGrades()
      setState({ grades })
    }
    catch (error) {
      console.error('Error fetching grades:', error)
      setState({
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des niveaux',
      })
    }
  }, [])

  const fetchClasses = useCallback(async () => {
    try {
      setState({ error: null })
      const classes = await getEducatorClasses()
      setState({ classes })
    }
    catch (error) {
      console.error('Error fetching classes:', error)
      setState({
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des classes',
      })
    }
  }, [])

  const setFilters = useCallback((newFilters: Partial<IInscriptionQueryParams>) => {
    setState({
      filters: { ...state.filters, ...newFilters },
      currentPage: newFilters.page || state.currentPage,
    })
  }, [])

  const setCurrentPage = useCallback((page: number) => {
    setState({ currentPage: page })
  }, [])

  const clearData = useCallback(() => {
    setState({
      inscriptions: [],
      stats: null,
      grades: [],
      classes: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      filters: {},
      error: null,
    })
  }, [])

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchInscriptions(state.filters),
      fetchStats(),
    ])
  }, [fetchInscriptions, fetchStats])

  const hasInscriptions = state.inscriptions.length > 0
  const hasNoInscriptions = !state.isLoading && state.inscriptions.length === 0

  return {
    // State
    inscriptions: state.inscriptions,
    stats: state.stats,
    grades: state.grades,
    classes: state.classes,
    isLoading: state.isLoading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    filters: state.filters,

    // Actions
    fetchInscriptions,
    fetchStats,
    fetchGrades,
    fetchClasses,
    setFilters,
    setCurrentPage,
    clearData,
    refreshData,

    // Computed values
    hasInscriptions,
    hasNoInscriptions,
    totalPages: state.totalPages,
  }
}
