import { getDayName } from '@/lib/utils'
import { useEffect, useState } from 'react'

export const TimelineIndicator: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const currentDay = getDayName(currentTime.getDay())
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const timelinePosition = ((currentHour - 7) * 72) + ((currentMinute / 60) * 72) + 88

  if (currentHour < 7 || currentHour >= 19 || currentDay === 'Samedi' || currentDay === 'Dimanche') {
    return null
  }

  return (
    <div
      className="absolute inset-x-0 z-10 pointer-events-none"
      style={{
        top: `${timelinePosition}px`,
        transform: 'translateY(-50%)',
      }}
    >
      <div className="relative w-full flex items-center group">
        <div className="text-xs text-destructive font-medium pr-2 opacity-80 ml-2">
          {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="flex-grow h-0.5 bg-destructive opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -right-1 -top-1.5 w-3 h-3 bg-destructive rounded-full opacity-80 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  )
}
