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

export async function getStudentAttendanceStats(studentId: string): Promise<AttendanceStats> {
  const supabase = await createClient()

  try {
    const { data: reportData, error: reportError } = await supabase
      .from('attendances_report_view')
      .select('*')
      .eq('student_id', studentId)
      .order('month', { ascending: false })

    if (reportError)
      throw reportError

    if (!reportData?.length) {
      return {
        totalDaysAbsent: 0,
        totalLateArrivals: 0,
        justifiedAbsences: 0,
        unjustifiedAbsences: 0,
      }
    }

    const { count: justifiedCount, error: justifiedError } = await supabase
      .from('attendances')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('status', 'absent')
      .eq('is_excused', true)

    if (justifiedError)
      throw justifiedError

    const totalAbsences = reportData.reduce((acc, curr) => acc + (curr.absences || 0), 0)
    const totalLateArrivals = reportData.reduce((acc, curr) => acc + (curr.lates || 0), 0)

    return {
      totalDaysAbsent: totalAbsences,
      totalLateArrivals,
      justifiedAbsences: justifiedCount || 0,
      unjustifiedAbsences: totalAbsences - (justifiedCount || 0),
    }
  }
  catch (error) {
    console.error('Error fetching attendance stats:', error)
    throw error
  }
}

export async function getStudentAttendanceHistory(studentId: string): Promise<Attendance[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
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

    if (error)
      throw error

    return data.map(record => ({
      id: record.id,
      date: new Date(record.created_date!).toLocaleDateString('fr-FR'),
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
