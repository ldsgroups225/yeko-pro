import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import { fetchClassSchedule, getClassId, updateSchedule as updateScheduleService } from '@/services'
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
  updateSchedule: (updatedSchedule: IScheduleCalendarDTO) => void
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

      updateSchedule: async (updatedSchedule) => {
        try {
          set({ isLoading: true, error: null }, false, 'scheduleStore/updateSchedule/pending')

          const currentSchedules = get().currentClassSchedule
          const classSlug = currentSchedules[0]?.classId

          if (!classSlug) {
            throw new Error('No active class found')
          }

          // Get all subclasses from the current class
          const currentClass = get().currentClassSchedule[0]
          if (!currentClass) {
            throw new Error('No active schedule found')
          }

          const updated = await updateScheduleService(
            updatedSchedule.id,
            {
              dayOfWeek: updatedSchedule.dayOfWeek,
              startTime: updatedSchedule.startTime,
              endTime: updatedSchedule.endTime,
              subjectId: updatedSchedule.subjectId,
              teacherId: updatedSchedule.teacherId,
            },
          )

          const updatedSchedules = currentSchedules.map(schedule =>
            schedule.id === updatedSchedule.id ? updatedSchedule : schedule,
          )

          set(
            {
              currentClassSchedule: updatedSchedules,
              isLoading: false,
            },
            false,
            'scheduleStore/updateSchedule/fulfilled',
          )

          return updated
        }
        catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to update schedule'
          console.error('updateSchedule error:', message)

          set(
            {
              error: message,
              isLoading: false,
            },
            false,
            'scheduleStore/updateSchedule/rejected',
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
