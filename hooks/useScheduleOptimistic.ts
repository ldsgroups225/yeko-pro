import type { IScheduleCalendarDTO } from '@/types'
import { startTransition, useOptimistic } from 'react'
import { useSchedules } from './useSchedule'

export function useScheduleOptimistic() {
  const { schedules, updateSchedule } = useSchedules()

  const [optimisticSchedules, addOptimisticSchedule] = useOptimistic(
    schedules,
    (
      state: IScheduleCalendarDTO[],
      updatedSchedule: IScheduleCalendarDTO,
    ) => state.map(schedule => schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
    ),
  )

  async function updateScheduleOptimistic(updatedSchedule: IScheduleCalendarDTO) {
    startTransition(() => {
      addOptimisticSchedule(updatedSchedule)
    })

    try {
      await updateSchedule(updatedSchedule)
    }
    catch (error) {
      console.error('Failed to update schedule:', error)
      throw error
    }
  }

  return {
    schedules: optimisticSchedules,
    updateSchedule: updateScheduleOptimistic,
  }
}
