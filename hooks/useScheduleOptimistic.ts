import type { IScheduleCalendarDTO } from '@/types'
import { startTransition, useOptimistic } from 'react'
import { useSchedules } from './useSchedule'

export function useScheduleOptimistic() {
  const { schedules, updateSchedule } = useSchedules()

  const [optimisticSchedules, addOptimisticSchedule] = useOptimistic(
    schedules,
    (state: IScheduleCalendarDTO[], updatedSchedule: IScheduleCalendarDTO) =>
      state.map(schedule =>
        schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
      ),
  )

  async function updateScheduleOptimistic(updatedSchedule: IScheduleCalendarDTO) {
    startTransition(() => {
      // Add optimistic update immediately
      addOptimisticSchedule(updatedSchedule)
    })

    try {
      // Perform actual update
      await updateSchedule(updatedSchedule)
    }
    catch (error) {
      // Note: No need to manually revert the optimistic update
      // React will automatically revert to the actual state if an error occurs
      console.error('Failed to update schedule:', error)
      throw error
    }
  }

  return {
    schedules: optimisticSchedules,
    updateSchedule: updateScheduleOptimistic,
  }
}
