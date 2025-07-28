'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useSchoolYearStore from '@/store/schoolYearStore'
import { EditJustificationDialog } from './EditJustificationDialog'
import { ImagePreviewDialog } from './ImagePreviewDialog'
import { JustificationDialog } from './JustificationDialog'

export interface Attendance {
  id: string
  date: string
  type: 'absence' | 'late'
  status: 'justified' | 'unjustified'
  reason?: string
  imageUrl?: string
}

interface AttendanceHistoryProps {
  attendances: Attendance[]
  studentName: string
  onAttendanceUpdated: () => void
}

export function AttendanceHistory({ attendances, studentName, onAttendanceUpdated }: AttendanceHistoryProps) {
  const { semesters, activeSemester } = useSchoolYearStore()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  // Derive semester from URL params - single source of truth
  const selectedSemester = searchParams.get('semester') || activeSemester?.id.toString()

  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [showJustificationDialog, setShowJustificationDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')

  const handleSemesterChange = (semesterId: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('semester', semesterId)

    replace(`${pathname}?${params.toString()}`)
  }

  const handleJustifyClick = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setShowJustificationDialog(true)
  }

  const handlePreviewClick = (imageUrl: string, attendance: Attendance) => {
    setPreviewImageUrl(imageUrl)
    setSelectedAttendance(attendance)
    setShowImagePreview(true)
  }

  const handleEditClick = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setShowEditDialog(true)
  }

  const handleJustified = () => {
    onAttendanceUpdated()
  }

  const getStatusBadge = (attendance: Attendance) => {
    if (attendance.status === 'justified') {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Justifié
          </Badge>
          <div className="flex items-center gap-1">
            {attendance.imageUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePreviewClick(attendance.imageUrl!, attendance)}
                className="h-6 w-6 p-0"
                title="Voir l'image"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditClick(attendance)}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
              title="Modifier la justification"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleJustifyClick(attendance)}
        className="text-xs"
      >
        Cliquer pour justifier
      </Button>
    )
  }

  const getTypeBadge = (type: 'absence' | 'late') => {
    const variant = type === 'absence' ? 'destructive' : 'secondary'
    const text = type === 'absence' ? 'Absence' : 'Retard'
    return <Badge variant={variant}>{text}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dernières absences</h3>
        <Select value={selectedSemester} onValueChange={handleSemesterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sélectionner un trimestre" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map(semester => (
              <SelectItem key={semester.id} value={semester.id.toString()}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {attendances.map(attendance => (
            <motion.div
              key={attendance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="px-4 py-1.5">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Date */}
                    <div className="col-span-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {attendance.date}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      {getTypeBadge(attendance.type)}
                    </div>

                    {/* Reason */}
                    <div className="col-span-4">
                      <span className="text-sm text-muted-foreground">
                        {attendance.reason || 'pas de raison'}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-4 flex justify-end">
                      {getStatusBadge(attendance)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {attendances.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Aucune absence enregistrée pour cette période.
          </div>
        )}
      </div>

      {/* Justification Dialog */}
      {selectedAttendance && (
        <JustificationDialog
          isOpen={showJustificationDialog}
          onClose={() => setShowJustificationDialog(false)}
          attendanceId={selectedAttendance.id}
          studentName={studentName}
          attendanceType={selectedAttendance.type}
          attendanceDate={selectedAttendance.date}
          onJustified={handleJustified}
        />
      )}

      {/* Edit Justification Dialog */}
      {selectedAttendance && selectedAttendance.status === 'justified' && (
        <EditJustificationDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          attendanceId={selectedAttendance.id}
          studentName={studentName}
          attendanceType={selectedAttendance.type}
          attendanceDate={selectedAttendance.date}
          currentReason={selectedAttendance.reason || ''}
          currentImageUrl={selectedAttendance.imageUrl || ''}
          onJustified={handleJustified}
        />
      )}

      {/* Image Preview Dialog */}
      {selectedAttendance && (
        <ImagePreviewDialog
          isOpen={showImagePreview}
          onClose={() => setShowImagePreview(false)}
          imageUrl={previewImageUrl}
          studentName={studentName}
          attendanceDate={selectedAttendance.date}
          attendanceType={selectedAttendance.type}
        />
      )}
    </div>
  )
}
