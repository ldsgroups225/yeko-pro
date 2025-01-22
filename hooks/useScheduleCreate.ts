import type { IScheduleCalendarDTO } from '@/types'
import { createSchedule } from '@/services'
import { startTransition, useOptimistic } from 'react'
import { useSchedules } from './useSchedule'

export function useScheduleCreate() {
  const { schedules } = useSchedules()

  const [optimisticSchedules, addOptimisticSchedule] = useOptimistic(
    schedules,
    (state: IScheduleCalendarDTO[], newSchedule: IScheduleCalendarDTO) =>
      [...state, newSchedule],
  )

  async function createScheduleOptimistic(
    scheduleData: Omit<IScheduleCalendarDTO, 'id'>,
    classSlug: string,
    mergedClasses: { id: string, slug: string, name: string }[],
  ) {
    // Create a temporary ID for optimistic update
    const tempSchedule: IScheduleCalendarDTO = {
      ...scheduleData,
      id: `temp-${Date.now()}`,
    }

    startTransition(() => {
      // Add optimistic update immediately
      addOptimisticSchedule(tempSchedule)
    })

    try {
      // Perform actual creation
      const createdSchedule = await createSchedule(scheduleData, classSlug, mergedClasses)
      return createdSchedule
    }
    catch (error) {
      // Note: No need to manually revert the optimistic update
      // React will automatically revert to the actual state if an error occurs
      console.error('Failed to create schedule:', error)
      throw error
    }
  }

  return {
    schedules: optimisticSchedules,
    createSchedule: createScheduleOptimistic,
  }
}
