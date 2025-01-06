import type { IScheduleCalendarDTO } from '@/types'
import { calculateEventDuration, calculateEventPosition } from '@/lib/utils'

interface EventCellProps {
  event: IScheduleCalendarDTO
}

export const EventCell: React.FC<EventCellProps> = ({ event }) => {
  const top = calculateEventPosition(event.startTime)
  const height = calculateEventDuration(event.startTime, event.endTime)

  return (
    <div
      className="absolute left-0 right-0 m-0 bg-primary/20 hover:bg-primary/30 p-2
        rounded-lg shadow-sm hover:shadow-md transition-all duration-200
        cursor-pointer border border-border/50"
      style={{
        top: `${top}px`,
        height: `${height}px`,
      }}
    >
      <div className="font-medium text-foreground">{event.subjectName}</div>
      <div className="text-xs space-y-1 text-muted-foreground">
        <div>{event.teacherName}</div>
        <div>{event.room || event.classroomName}</div>
        <div>{`${event.startTime} - ${event.endTime}`}</div>
      </div>
    </div>
  )
}
