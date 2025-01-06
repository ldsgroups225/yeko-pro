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
