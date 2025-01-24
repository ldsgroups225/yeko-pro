import type { IScheduleCalendarDTO } from '@/types'
import { startTransition, useOptimistic } from 'react'
import { useSchedules } from './useSchedule'

export function useScheduleCreate() {
  const { schedules, createSchedule } = useSchedules()

  const [optimisticSchedules, addOptimisticSchedule] = useOptimistic(
    schedules,
    (
      state: IScheduleCalendarDTO[],
      newSchedule: IScheduleCalendarDTO,
    ) =>
      [...state, newSchedule]
        .sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek)
            return a.dayOfWeek - b.dayOfWeek

          const startTimeComparison = a.startTime.localeCompare(b.startTime)
          if (startTimeComparison !== 0)
            return startTimeComparison

          return a.endTime.localeCompare(b.endTime)
        }),
  )

  async function createScheduleOptimistic(scheduleData: Omit<IScheduleCalendarDTO, 'id'>) {
    // Create a temporary ID for optimistic update
    const tempSchedule: IScheduleCalendarDTO = {
      ...scheduleData,
      id: `temp-${Date.now()}`,
    }

    startTransition(() => {
      addOptimisticSchedule(tempSchedule)
    })

    try {
      await createSchedule(scheduleData)
    }
    catch (error) {
      console.error('Failed to create schedule:', error)
      throw error
    }
  }

  return {
    schedules: optimisticSchedules,
    createSchedule: createScheduleOptimistic,
  }
}
