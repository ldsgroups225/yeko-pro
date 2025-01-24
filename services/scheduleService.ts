'use server'

import type { IClassesGrouped, IScheduleCalendarDTO } from '@/types'
import { createClient } from '@/lib/supabase/server'
import { formatFullName } from '@/lib/utils'

interface ClassroomResponse {
  id: string
}

interface ScheduleResponse {
  id: string
  subject?: {
    name: string
  }
  teacher?: {
    first_name: string
    last_name: string
  }
  day_of_week: number
  start_time: string
  end_time: string
  subject_id: string
  teacher_id: string
}

/**
 * Get classId of a class from slug.
 *
 * @param {string} classSlug - slug of the class
 * @returns {Promise<string>} Class ID
 * @throws {Error} If fetch fails or class not found
 */
export async function getClassId(classSlug: string): Promise<string> {
  const supabase = createClient()

  try {
    const { data: classroom, error: classIdError } = await supabase
      .from('classes')
      .select('id')
      .eq('slug', classSlug)
      .single()
      .throwOnError()

    if (classIdError) {
      console.error('Error fetching class ID:', classIdError)
      throw new Error('Failed to fetch class ID')
    }

    if (!classroom) {
      throw new Error(`Class not found with slug: ${classSlug}`)
    }

    return (classroom as ClassroomResponse).id
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred while fetching class ID'
    console.error('getClassId error:', message)
    throw error
  }
}

/**
 * Maps a schedule response to the DTO format
 *
 * @param {ScheduleResponse} schedule - Raw schedule data from database
 * @param {string} classSlug - Class slug
 * @param {IClassesGrouped['subclasses']} mergedClasses - Merged classes data
 * @returns {IScheduleCalendarDTO} Formatted schedule data
 */
function mapScheduleToDTO(
  schedule: ScheduleResponse,
  classSlug: string,
  mergedClasses: IClassesGrouped['subclasses'],
): IScheduleCalendarDTO {
  const currentClass = mergedClasses.find(c => c.slug === classSlug)

  return {
    id: schedule.id,
    subjectName: schedule.subject?.name ?? '',
    teacherName: schedule.teacher
      ? formatFullName(schedule.teacher.first_name, schedule.teacher.last_name)
      : '',
    classId: currentClass?.slug ?? '',
    classroomName: currentClass?.name ?? '',
    dayOfWeek: schedule.day_of_week,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    subjectId: schedule.subject_id,
    teacherId: schedule.teacher_id,
  }
}

/**
 * Fetches weekly timetable of a class.
 *
 * @param {string} classSlug - slug of the class
 * @param {IClassesGrouped['subclasses']} mergedClasses - Merged classes
 * @returns {Promise<IScheduleCalendarDTO[]>} Weekly timetable of the class
 * @throws {Error} If fetch fails
 */
export async function fetchClassSchedule(
  classSlug: string,
  mergedClasses: IClassesGrouped['subclasses'],
): Promise<IScheduleCalendarDTO[]> {
  const supabase = createClient()

  try {
    const classId = await getClassId(classSlug)

    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*, subject:subjects(name), teacher:users(first_name, last_name)')
      .eq('class_id', classId)
      .order('day_of_week')
      .order('start_time')
      .order('end_time')
      .throwOnError()

    if (error) {
      console.error('Error fetching class schedule:', error)
      throw new Error('Failed to fetch class schedule')
    }

    if (!schedules) {
      return []
    }

    return schedules.map(schedule =>
      mapScheduleToDTO(schedule as ScheduleResponse, classSlug, mergedClasses),
    )
  }
  catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred while fetching class schedule'
    console.error('fetchClassSchedule error:', message)
    throw error
  }
}

interface ValidationError {
  field: string
  message: string
}

class ScheduleUpdateError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly validationErrors?: ValidationError[],
  ) {
    super(message)
    this.name = 'ScheduleUpdateError'
  }
}

/**
 * Updates an existing schedule entry with provided data.
 * Supports partial updates of schedule fields.
 *
 * @param {string} scheduleId - ID of the schedule to update
 * @param {UpdateScheduleInput} updateData - Data to update the schedule with
 * @returns {Promise<void>} Updated schedule data
 * @throws {ScheduleUpdateError} If update fails or validation errors occur
 */
/**
 * Creates a new schedule entry.
 *
 * @param {Omit<IScheduleCalendarDTO, 'id'>} scheduleData - Data for the new schedule
 * @param {string} classSlug - Class slug for mapping the response
 * @param {IClassesGrouped['subclasses']} mergedClasses - Merged classes data for mapping
 * @returns {Promise<IScheduleCalendarDTO>} Created schedule data
 * @throws {ScheduleUpdateError} If creation fails or validation errors occur
 */
export async function createSchedule(
  scheduleData: Omit<IScheduleCalendarDTO, 'id'>,
): Promise<string> {
  const supabase = createClient()

  try {
    const { data: newSchedule, error: createError } = await supabase
      .from('schedules')
      .insert({
        class_id: scheduleData.classId,
        end_time: scheduleData.endTime,
        start_time: scheduleData.startTime,
        subject_id: scheduleData.subjectId,
        teacher_id: scheduleData.teacherId,
        day_of_week: scheduleData.dayOfWeek,
      })
      .select('id')
      .single()
      .throwOnError()

    if (createError) {
      console.error('Failed to create schedule:', createError)
      throw new ScheduleUpdateError(
        'Failed to create schedule',
        'CREATE_ERROR',
      )
    }

    if (!newSchedule) {
      throw new ScheduleUpdateError(
        'No data returned after creation',
        'CREATE_ERROR',
      )
    }

    return newSchedule.id
  }
  catch (error) {
    if (error instanceof ScheduleUpdateError) {
      throw error
    }

    // Log and wrap unknown errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred while creating schedule'
    console.error('createSchedule error:', message)
    throw new ScheduleUpdateError(message, 'UNKNOWN_ERROR')
  }
}

export async function updateSchedule(
  scheduleId: string,
  updateData: Partial<IScheduleCalendarDTO>,
): Promise<void> {
  const supabase = createClient()

  try {
    // Update schedule
    const { data: updatedSchedule, error: updateError } = await supabase
      .from('schedules')
      .update({
        day_of_week: updateData.dayOfWeek,
        start_time: updateData.startTime,
        end_time: updateData.endTime,
        subject_id: updateData.subjectId,
        teacher_id: updateData.teacherId,
        class_id: updateData.classId,
      })
      .eq('id', scheduleId)
      .select('*, subject:subjects(name), teacher:users(first_name, last_name)')
      .single()
      .throwOnError()

    if (updateError) {
      console.error('Failed to update schedule:', updateError)
      throw new ScheduleUpdateError(
        'Failed to update schedule',
        'UPDATE_ERROR',
      )
    }

    if (!updatedSchedule) {
      throw new ScheduleUpdateError(
        'No data returned after update',
        'UPDATE_ERROR',
      )
    }
  }
  catch (error) {
    // Handle known errors
    if (error instanceof ScheduleUpdateError) {
      throw error
    }

    // Log and wrap unknown errors
    const message = error instanceof Error ? error.message : 'Unknown error occurred while updating schedule'
    console.error('updateSchedule error:', message)
    throw new ScheduleUpdateError(message, 'UNKNOWN_ERROR')
  }
}
