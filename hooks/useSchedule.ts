import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import useScheduleStore from '@/store/scheduleStore'

interface UseSchedulesResult {
  schedules: IScheduleCalendarDTO[]
  isLoading: boolean
  error: string | null

  loadSchedules: (classSlug: string, mergedClasses: IClassesGrouped['subclasses']) => Promise<void>
  clearSchedules: () => void
  updateSchedule: (updatedSchedule: IScheduleCalendarDTO) => Promise<void>
  createSchedule: (scheduleData: Omit<IScheduleCalendarDTO, 'id'>) => Promise<string>
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
    createSchedule,
    updateSchedule,
    clearSchedules,
    getSchedulesByClass,
    currentClassSchedule: schedules,
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

  return {
    // Data
    schedules,
    isLoading,
    error,

    // Actions
    loadSchedules,
    clearSchedules,
    createSchedule,
    updateSchedule,
  }
}
