import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import { fetchClassSchedule, getClassId } from '@/services'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Constants
const INITIAL_STATE = {
  visitedSchedules: [] as IScheduleCalendarDTO[][],
  currentClassSchedule: [] as IScheduleCalendarDTO[],
  isLoading: false,
  error: null as string | null,
  currentSchoolId: undefined as string | undefined,
}

type ClassState = typeof INITIAL_STATE

interface ClassActions {
  setSchedules: (schedules: IScheduleCalendarDTO[]) => void
  setVisitedSchedules: (schedules: IScheduleCalendarDTO[][]) => void
  fetchSchedulesByClass: (
    classSlug: string,
    mergedClasses: IClassesGrouped['subclasses']
  ) => Promise<IScheduleCalendarDTO[]>
  getSchedulesByClass: (
    classSlug: string,
    mergedClasses: IClassesGrouped['subclasses']
  ) => Promise<IScheduleCalendarDTO[]>
  clearSchedules: () => void
}

const useScheduleStore = create<ClassState & ClassActions>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      setSchedules: schedules =>
        set(
          { currentClassSchedule: schedules },
          false,
          'scheduleStore/setSchedules',
        ),

      setVisitedSchedules: schedules =>
        set(
          { visitedSchedules: schedules },
          false,
          'scheduleStore/setVisitedSchedules',
        ),

      fetchSchedulesByClass: async (classSlug, mergedClasses) => {
        set(
          { isLoading: true, error: null },
          false,
          'scheduleStore/fetchSchedulesByClass/pending',
        )

        try {
          const schedulesData = await fetchClassSchedule(classSlug, mergedClasses)

          set(
            {
              currentClassSchedule: schedulesData,
              visitedSchedules: [...get().visitedSchedules, schedulesData],
              isLoading: false,
            },
            false,
            'scheduleStore/fetchSchedulesByClass/fulfilled',
          )

          return schedulesData
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to fetch class schedule'

          set(
            {
              error: errorMessage,
              isLoading: false,
              currentClassSchedule: [],
            },
            false,
            'scheduleStore/fetchSchedulesByClass/rejected',
          )

          throw error
        }
      },

      getSchedulesByClass: async (classSlug, mergedClasses) => {
        try {
          const classId = await getClassId(classSlug)
          const existingSchedules = get().visitedSchedules.find(schedules =>
            schedules.some(schedule => schedule.classId === classId),
          )

          if (existingSchedules) {
            return existingSchedules
          }

          return get().fetchSchedulesByClass(classSlug, mergedClasses)
        }
        catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : 'Failed to get class schedules'

          set(
            { error: errorMessage },
            false,
            'scheduleStore/getSchedulesByClass/rejected',
          )

          throw error
        }
      },

      clearSchedules: () =>
        set(
          { ...INITIAL_STATE },
          false,
          'scheduleStore/clearSchedules',
        ),
    }),
    { name: 'ScheduleStore' },
  ),
)

export default useScheduleStore
