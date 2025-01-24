export function calculatePosition(time: string) {
  // Handle both "HH:mm" and "HHmm" formats
  const normalizedTime = time.includes(':') ? time : `${time.slice(0, 2)}:${time.slice(2)}`
  const [hours, minutes] = normalizedTime.split(':').map(Number)
  return (hours - 7) * 60 + minutes
}

export function getDayColumn(dayOfWeek: number) {
  const dayIndex = dayOfWeek - 1 // Convert to 0-based index
  return dayIndex >= 0 && dayIndex < 5 ? dayIndex + 1 : 0
}
