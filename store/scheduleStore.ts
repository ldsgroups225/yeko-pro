import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ScheduleValidator } from '@/lib/utils'
import { createSchedule, fetchClassSchedule, getClassId, updateSchedule as updateScheduleService } from '@/services'

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
  updateSchedule: (updatedSchedule: IScheduleCalendarDTO) => Promise<void>
  createSchedule: (scheduleData: Omit<IScheduleCalendarDTO, 'id'>) => Promise<string>
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

      createSchedule: async (schedule) => {
        try {
          set({ isLoading: true, error: null }, false, 'scheduleStore/createSchedule/pending')

          // Validate required fields
          if (!schedule.classId?.length || !schedule.subjectId?.length || !schedule.teacherId?.length) {
            throw new Error('Veuillez remplir tous les champs')
          }

          // Check if there's an active class schedule
          const currentClass = get().currentClassSchedule[0]
          if (!currentClass) {
            throw new Error('Pas de planning actif trouvé')
          }

          // Validate time slot availability
          const { isValid } = ScheduleValidator.validateSchedule(
            {
              start_time: schedule.startTime,
              end_time: schedule.endTime,
              day_of_week: schedule.dayOfWeek,
            },
            get().currentClassSchedule.map(s => ({
              start_time: s.startTime,
              end_time: s.endTime,
              day_of_week: s.dayOfWeek,
            })),
          )

          if (!isValid) {
            throw new Error('Cette plage de temps est déjà occupée')
          }

          // Create the schedule
          const createdId = await createSchedule(schedule)

          // Create new schedule with the returned ID
          const newSchedule: IScheduleCalendarDTO = {
            ...schedule,
            id: createdId,
          }

          // Update state with new schedule
          const updatedSchedules = [...get().currentClassSchedule, newSchedule]
            .sort((a, b) => {
              if (a.dayOfWeek !== b.dayOfWeek)
                return a.dayOfWeek - b.dayOfWeek

              const startTimeComparison = a.startTime.localeCompare(b.startTime)
              if (startTimeComparison !== 0)
                return startTimeComparison

              return a.endTime.localeCompare(b.endTime)
            })

          set(
            {
              currentClassSchedule: updatedSchedules,
              isLoading: false,
            },
            false,
            'scheduleStore/createSchedule/fulfilled',
          )

          return createdId
        }
        catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to create schedule'
          console.error('createSchedule error:', message)

          set(
            {
              error: message,
              isLoading: false,
            },
            false,
            'scheduleStore/createSchedule/rejected',
          )

          throw error
        }
      },

      updateSchedule: async (updatedSchedule) => {
        try {
          set({ isLoading: true, error: null }, false, 'scheduleStore/updateSchedule/pending')

          const currentSchedules = get().currentClassSchedule
          const classId = currentSchedules[0]?.classId

          if (!classId) {
            throw new Error('No active class found')
          }

          // Get all subclasses from the current class
          const currentClass = get().currentClassSchedule[0]
          if (!currentClass) {
            throw new Error('No active schedule found')
          }

          // Validate time slot availability
          // Filter out the current schedule being updated from validation
          const otherSchedules = currentSchedules.filter(s => s.id !== updatedSchedule.id)
          const { isValid } = ScheduleValidator.validateSchedule(
            {
              start_time: updatedSchedule.startTime,
              end_time: updatedSchedule.endTime,
              day_of_week: updatedSchedule.dayOfWeek,
            },
            otherSchedules.map(s => ({
              start_time: s.startTime,
              end_time: s.endTime,
              day_of_week: s.dayOfWeek,
            })),
          )

          if (!isValid) {
            throw new Error('Cette plage de temps est déjà occupée')
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
