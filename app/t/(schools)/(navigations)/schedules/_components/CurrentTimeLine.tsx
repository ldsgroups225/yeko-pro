import { useEffect, useState } from 'react'
import { calculatePosition } from '@/lib/utils'

export function CurrentTimeLine() {
  const getCurrentPosition = () => {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    return calculatePosition(currentTime)
  }

  const [position, setPosition] = useState(getCurrentPosition)

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(getCurrentPosition())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  if (position < 0 || position > 660)
    return null

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-50"
      style={{ top: `${position}px` }}
    >
      <div className="absolute -left-2 -top-1 w-3 h-3 bg-red-500 rounded-full shadow-sm" />
    </div>
  )
}
