import type { IScheduleCalendarDTO } from '@/types'
import { calculateEventDuration, calculateEventPosition, cn } from '@/lib/utils'
import { useState } from 'react'
import { EditCourseDialog } from './EditCourseDialog'
import styles from './EventCell.module.css'

interface EventCellProps {
  event: IScheduleCalendarDTO
  onEventUpdate?: (event: IScheduleCalendarDTO) => void
}

export const EventCell: React.FC<EventCellProps> = ({ event, onEventUpdate }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const top = calculateEventPosition(event.startTime)
  const height = calculateEventDuration(event.startTime, event.endTime)

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + (minutes || 0)
  }

  const start = timeToMinutes(event.startTime)
  const end = timeToMinutes(event.endTime)
  const isOneHour = (end - start) === 60

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsEditDialogOpen(true)
  }

  const handleEventUpdate = (updatedEvent: IScheduleCalendarDTO) => {
    onEventUpdate?.(updatedEvent)
    setIsEditDialogOpen(false)
  }

  return (
    <>
      <div
        className={`${styles.eventCell} relative group select-none`}
        style={{ top: `${top}px`, height: `${height}px` }}
        onDoubleClick={handleDoubleClick}
      >
        <div className={cn(
          'font-medium text-foreground truncate overflow-x-hidden',
          isOneHour && '-mt-3',
        )}
        >
          {event.subjectName}
        </div>

        {/* Conditional rendering with hover */}
        <div className={cn(
          'text-xs text-muted-foreground',
          isOneHour
            ? '-space-y-1'
            : 'space-y-1.5',
        )}
        >
          <div>{event.teacherName}</div>
          <div>{event.room || event.classroomName}</div>
          <div>{`${event.startTime} - ${event.endTime}`}</div>
        </div>
      </div>

      <EditCourseDialog
        event={event}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onEditEvent={handleEventUpdate}
      />
    </>
  )
}
