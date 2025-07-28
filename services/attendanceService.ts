// services/attendanceService.ts

'use server'

import { createClient } from '@/lib/supabase/server'
import { uploadImageToStorage } from './uploadImageService'

export interface AttendanceStats {
  totalDaysAbsent: number
  totalLateArrivals: number
  justifiedAbsences: number
  unjustifiedAbsences: number
}

export interface Attendance {
  id: string
  date: string
  semester: number
  type: 'late' | 'absence'
  status: 'justified' | 'unjustified'
  reason?: string
  duration?: string
}

export async function getStudentAttendanceStats(studentId: string, semesterId?: number): Promise<AttendanceStats> {
  const supabase = await createClient()

  try {
    // Build the base query
    let query = supabase
      .from('attendances')
      .select('status, is_excused', { count: 'exact' })
      .eq('student_id', studentId)

    // Filter by semester if provided
    if (semesterId) {
      query = query.eq('semesters_id', semesterId)
    }

    const { data: attendances, error } = await query

    if (error) {
      throw error
    }

    if (!attendances?.length) {
      return {
        totalDaysAbsent: 0,
        totalLateArrivals: 0,
        justifiedAbsences: 0,
        unjustifiedAbsences: 0,
      }
    }

    // Calculate stats efficiently using the fetched data
    const totalAbsences = attendances.filter(a => a.status === 'absent').length
    const totalLateArrivals = attendances.filter(a => a.status === 'late').length
    const justifiedAbsences = attendances.filter(a => a.status === 'absent' && a.is_excused).length
    const unjustifiedAbsences = totalAbsences - justifiedAbsences

    return {
      totalDaysAbsent: totalAbsences,
      totalLateArrivals,
      justifiedAbsences,
      unjustifiedAbsences,
    }
  }
  catch (error) {
    console.error('Error fetching attendance stats:', error)
    throw error
  }
}

export async function getStudentAttendanceHistory(studentId: string, semesterId?: number): Promise<Attendance[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('attendances')
      .select(`
        id,
        created_date,
        status,
        is_excused,
        reason,
        starts_at,
        ends_at,
        semesters_id,
        image_url
      `)
      .eq('student_id', studentId)
      .order('created_date', { ascending: false })
      .limit(100) // Limit to last 100 records for better performance

    // Filter by semester if provided
    if (semesterId) {
      query = query.eq('semesters_id', semesterId)
    }

    const { data, error } = await query

    if (error)
      throw error

    // Use more efficient date formatting
    const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    return data.map(record => ({
      id: record.id,
      date: dateFormatter.format(new Date(record.created_date!)),
      type: record.status === 'late' ? 'late' : 'absence',
      status: record.is_excused ? 'justified' : 'unjustified',
      reason: record.reason || undefined,
      semester: record.semesters_id ?? -1,
      imageUrl: record.image_url || undefined,
      duration: record.status === 'late'
        ? calculateDuration(record.starts_at, record.ends_at)
        : undefined,
    }))
  }
  catch (error) {
    console.error('Error fetching absence history:', error)
    throw error
  }
}

export async function justifyAttendance(
  attendanceId: string,
  reason: string,
  justificationImage: string,
): Promise<void> {
  const supabase = await createClient()

  try {
    // Upload the justification image to storage
    const imageUrl = await uploadImageToStorage(supabase, 'attendance-justifications', attendanceId, justificationImage)

    // Update the attendance record to mark it as justified
    const { error } = await supabase
      .from('attendances')
      .update({
        is_excused: true,
        reason, // Store the text reason
        image_url: imageUrl, // Store the image URL
        updated_at: new Date().toISOString(),
      })
      .eq('id', attendanceId)

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'assiduité: ${error.message}`)
    }
  }
  catch (error) {
    console.error('Error justifying attendance:', error)
    throw error
  }
}

export async function updateAttendanceJustification(
  attendanceId: string,
  reason: string,
  justificationImage: string,
): Promise<void> {
  const supabase = await createClient()

  try {
    // Upload the new justification image to storage
    const imageUrl = await uploadImageToStorage(supabase, 'attendance_justifications', attendanceId, justificationImage)

    // Update the attendance record with new justification
    const { error } = await supabase
      .from('attendances')
      .update({
        reason, // Update the text reason
        image_url: imageUrl, // Update the image URL
        updated_at: new Date().toISOString(),
      })
      .eq('id', attendanceId)

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la justification: ${error.message}`)
    }
  }
  catch (error) {
    console.error('Error updating attendance justification:', error)
    throw error
  }
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))
  return `${diffMinutes} minutes`
}
