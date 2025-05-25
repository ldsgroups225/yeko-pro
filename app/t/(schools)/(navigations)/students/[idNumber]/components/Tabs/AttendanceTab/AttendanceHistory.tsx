'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import useSchoolYearStore from '@/store/schoolYearStore'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'

export interface Attendance {
  id: string
  date: string
  type: 'absence' | 'late'
  status: 'justified' | 'unjustified'
  semester: number
  reason?: string
  duration?: string
}

interface AttendanceHistoryProps {
  attendances: Attendance[]
  isLoading?: boolean
}

function AttendanceRow({ attendance }: { attendance: Attendance }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeOut' } }}
      transition={{ duration: 0.4, ease: [0.42, 0, 0.58, 1] }}
      className="flex justify-between text-sm"
    >
      <span>{attendance.date}</span>
      <div className="flex items-center gap-2">
        <Badge
          variant={attendance.type === 'absence' ? 'destructive' : 'default'}
          className="w-24 justify-center items-center"
        >
          {attendance.type === 'absence' ? 'Absence' : 'Retard'}
        </Badge>
        <Badge
          variant={attendance.status === 'justified' ? 'outline' : 'secondary'}
          className="w-24 justify-center items-center"
        >
          {attendance.status === 'justified' ? 'Justifié' : 'Non justifié'}
        </Badge>
      </div>
      <span
        className={cn(
          'text-muted-foreground',
          attendance.reason && 'font-bold text-primary',
        )}
      >
        {attendance.reason || 'pas de raison'}
      </span>
    </motion.div>
  )
}

function AttendanceRowSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function AttendanceHistory({ attendances, isLoading }: AttendanceHistoryProps) {
  const { activeSemester, semesters } = useSchoolYearStore()

  const [selectedSemesterByUser, setSelectedSemesterByUser] = useState<number | null>(null)

  const effectiveSemesterId = useMemo(() => {
    return selectedSemesterByUser ?? activeSemester?.id ?? null
  }, [selectedSemesterByUser, activeSemester?.id])

  const filteredAttendances = useMemo(() => {
    if (effectiveSemesterId === null) {
      return []
    }
    return attendances.filter(at => at.semester === effectiveSemesterId)
  }, [attendances, effectiveSemesterId])

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="text-sm font-medium">Dernières absences:</div>
              <div className="space-y-4">
                <AttendanceRowSkeleton />
                <AttendanceRowSkeleton />
                <AttendanceRowSkeleton />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (attendances.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardContent className="p-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-sm text-muted-foreground text-center py-4"
            >
              Aucune absence enregistrée
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-3 text-sm items-center"
            >
              <div className="text-sm font-medium">Dernières absences:</div>
              <div className="text-sm font-medium max-w-[200px] mx-auto pr-4">
                <Select
                  onValueChange={value => setSelectedSemesterByUser(Number(value))}
                  value={effectiveSemesterId?.toString() ?? ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélection du trim." />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map(sm => (
                      <SelectItem key={sm.id} value={sm.id.toString()}>{sm.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div />
            </motion.div>

            <AnimatePresence mode="popLayout">
              {/* This is the container for the list that will expand/reduce */}
              <motion.div
                layout
                transition={{
                  // Option 1: Spring (often feels more natural for layout)
                  // type: "spring",
                  // stiffness: 300,
                  // damping: 30,

                  // Option 2: Tween (for more predictable timing, matching other animations)
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="space-y-4 min-h-[60px]"
                key={`attendance-list-container-${effectiveSemesterId}`}
              >
                {filteredAttendances.length > 0
                  ? (
                      filteredAttendances.map(atd => (
                        <AttendanceRow key={atd.id} attendance={atd} />
                      ))
                    )
                  : (
                      <motion.div
                        key="no-attendance-message"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeOut' } }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="text-sm text-muted-foreground text-center py-4 flex items-center justify-center min-h-[60px]"
                      >
                        {effectiveSemesterId !== null ? 'Aucune absence pour ce semestre.' : 'Veuillez sélectionner un semestre.'}
                      </motion.div>
                    )}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
