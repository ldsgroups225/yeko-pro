import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import useScheduleStore from '@/store/scheduleStore'
import { useDebouncedCallback } from 'use-debounce'

interface UseSchedulesResult {
  schedules: IScheduleCalendarDTO[]
  isLoading: boolean
  error: string | null

  loadSchedules: (classSlug: string, mergedClasses: IClassesGrouped['subclasses']) => Promise<void>
  clearSchedules: () => void
  updateSchedule: (updatedSchedule: IScheduleCalendarDTO) => void
}

/**
 * Custom hook to interact with the schedule store.
 * Provides pagination, filtering, and data access functionality.
 *
 * @returns {UseSchedulesResult} Object containing schedule-related functions and data
 */
export function useSchedules(): UseSchedulesResult {
  const {
    error,
    isLoading,
    clearSchedules,
    getSchedulesByClass,
    currentClassSchedule: schedules,
    updateSchedule,
  } = useScheduleStore()

  // Schedules
  const loadSchedules = async (classSlug: string, mergedClasses: IClassesGrouped['subclasses']): Promise<void> => {
    try {
      await getSchedulesByClass(classSlug, mergedClasses)
    }
    catch (error) {
      console.error('Failed to load schedules:', error)
      throw error
    }
  }

  // useDebouncedCallback for loadSchedules
  const _debouncedLoadSchedules = useDebouncedCallback(async (classSlug: string, mergedClasses: IClassesGrouped['subclasses']) => {
    await loadSchedules(classSlug, mergedClasses)?.then(r => r)
  }, 0)

  return {
    // Data
    schedules,
    isLoading,
    error,

    // Actions
    loadSchedules,
    clearSchedules,
    updateSchedule,
  }
}
