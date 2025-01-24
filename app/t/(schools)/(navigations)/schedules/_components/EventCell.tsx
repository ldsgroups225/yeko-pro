import type { IScheduleCalendarDTO } from '@/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { EditCourseDialog } from './EditCourseDialog'

interface EventCellProps {
  event: IScheduleCalendarDTO
  style: React.CSSProperties
  onEventUpdate?: (event: IScheduleCalendarDTO) => void
}

function EventCell({ event, style, onEventUpdate }: EventCellProps) {
  const [currentTime, setCurrentTime] = useState(format(new Date(), 'HH:mm:ss'))
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const isOneHour = useMemo(() => {
    const startHour = Number.parseInt(event.startTime.split(':')[0])
    const endHour = Number.parseInt(event.endTime.split(':')[0])
    return endHour - startHour === 1
  }, [event.startTime, event.endTime])

  const isActive = useMemo(() => {
    return currentTime >= event.startTime && currentTime <= event.endTime
  }, [currentTime, event.startTime, event.endTime])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm:ss'))
    }, 60000)

    return () => clearInterval(intervalId)
  }, [])

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
        className={cn(
          'absolute left-1 right-1 overflow-hidden rounded-lg border bg-card p-2 shadow-sm transition-all',
          'hover:shadow-md hover:z-10 cursor-pointer border-l-4',
          isActive
            ? 'border-primary opacity-100'
            : 'border-muted opacity-70',
        )}
        style={style}
        onDoubleClick={handleDoubleClick}
      >
        <h3 className="text-sm font-medium truncate">{event.subjectName}</h3>
        <p className="text-xs text-muted-foreground truncate">
          {event.teacherName}
        </p>
        <div className={cn(
          'text-xs flex justify-between items-center',
          isOneHour ? '-mt-0.5' : 'mt-1',
        )}
        >
          <span>
            {event.startTime.substring(0, 5)}
            {' '}
            -
            {event.endTime.substring(0, 5)}
          </span>
          <span className="bg-muted px-2 py-1 rounded text-xs">
            {event.room}
          </span>
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

export { EventCell }
