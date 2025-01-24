export interface TimeSlot {
  start_time: string
  end_time: string
  day_of_week: number
  id?: string
}

export interface ScheduleOverlapOptions {
  allowSameTime?: boolean
  considerSubsequentDays?: boolean
}

export class ScheduleValidator {
  static parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 60 + minutes
  }

  static isTimeOverlap(
    slot1: TimeSlot,
    slot2: TimeSlot,
    options: ScheduleOverlapOptions = {},
  ): boolean {
    const {
      allowSameTime = false,
      considerSubsequentDays = false,
    } = options

    // Convert times to minutes
    const start1 = this.parseTime(slot1.start_time)
    const end1 = this.parseTime(slot1.end_time)
    const start2 = this.parseTime(slot2.start_time)
    const end2 = this.parseTime(slot2.end_time)

    // Check day match (or subsequent days if enabled)
    const dayMatch = considerSubsequentDays
      ? Math.abs(slot1.day_of_week - slot2.day_of_week) <= 1
      : slot1.day_of_week === slot2.day_of_week

    if (!dayMatch)
      return false

    // Overlap conditions
    const conditions = [
      // New slot starts during existing slot
      (start1 >= start2 && start1 < end2),
      // New slot ends during existing slot
      (end1 > start2 && end1 <= end2),
      // New slot completely contains existing slot
      (start1 <= start2 && end1 >= end2),
    ]

    // Handle same time edge case
    if (allowSameTime) {
      conditions.push(start1 === start2 && end1 === end2)
    }

    return conditions.some(Boolean)
  }

  static findOverlappingSchedules(
    newSchedule: TimeSlot,
    existingSchedules: TimeSlot[],
    options: ScheduleOverlapOptions = {},
  ): TimeSlot[] {
    return existingSchedules.filter(schedule =>
      this.isTimeOverlap(newSchedule, schedule, options),
    )
  }

  static validateSchedule(
    newSchedule: TimeSlot,
    existingSchedules: TimeSlot[],
    options: ScheduleOverlapOptions = {},
  ): { isValid: boolean, conflicts: TimeSlot[] } {
    const conflicts = this.findOverlappingSchedules(
      newSchedule,
      existingSchedules,
      options,
    )

    return {
      isValid: conflicts.length === 0,
      conflicts,
    }
  }
}
