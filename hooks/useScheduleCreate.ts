import type { IScheduleCalendarDTO } from '@/types'
import { startTransition, useOptimistic } from 'react'
import { useSchedules } from './useSchedule'

interface ScheduleUpdate {
  temp: IScheduleCalendarDTO
  actual?: IScheduleCalendarDTO
}

export function useScheduleCreate() {
  const { schedules, createSchedule } = useSchedules()

  const [optimisticSchedules, addOptimisticSchedule] = useOptimistic<
    IScheduleCalendarDTO[],
    ScheduleUpdate
  >(
    schedules,
    (state, newScheduleUpdate) => {
      if (newScheduleUpdate.actual) {
        // Replace temporary schedule with actual one
        return state
          .filter(s => s.id !== newScheduleUpdate.temp.id)
          .concat(newScheduleUpdate.actual)
          .sort((a, b) => {
            if (a.dayOfWeek !== b.dayOfWeek)
              return a.dayOfWeek - b.dayOfWeek

            const startTimeComparison = a.startTime.localeCompare(b.startTime)
            if (startTimeComparison !== 0)
              return startTimeComparison

            return a.endTime.localeCompare(b.endTime)
          })
      }

      // Add temporary schedule
      return [...state, newScheduleUpdate.temp]
        .sort((a, b) => {
          if (a.dayOfWeek !== b.dayOfWeek)
            return a.dayOfWeek - b.dayOfWeek

          const startTimeComparison = a.startTime.localeCompare(b.startTime)
          if (startTimeComparison !== 0)
            return startTimeComparison

          return a.endTime.localeCompare(b.endTime)
        })
    },
  )

  async function createScheduleOptimistic(scheduleData: Omit<IScheduleCalendarDTO, 'id'>) {
    // Create a temporary ID for optimistic update
    const tempSchedule: IScheduleCalendarDTO = {
      ...scheduleData,
      id: `temp-${Date.now()}`,
    }

    startTransition(() => {
      addOptimisticSchedule({ temp: tempSchedule })
    })

    try {
      const createdId = await createSchedule(scheduleData)

      // Create the actual schedule with the returned ID
      const actualSchedule: IScheduleCalendarDTO = {
        ...scheduleData,
        id: createdId,
      }

      // Update optimistic state with actual schedule
      startTransition(() => {
        addOptimisticSchedule({ temp: tempSchedule, actual: actualSchedule })
      })

      return actualSchedule
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
