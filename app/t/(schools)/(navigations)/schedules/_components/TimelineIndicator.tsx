const HOURS = Array.from({ length: 11 }, (_, i) => i + 7) // 7 AM to 6 PM

export function TimelineIndicator() {
  return (
    <div className="sticky left-0 z-20 bg-background pr-2 min-w-[80px] pt-[60px]">
      {HOURS.map(hour => (
        <div
          key={hour}
          className="relative h-[60px] border-t text-sm"
          style={{ height: '60px' }}
        >
          <span className="absolute -top-3 right-2 bg-background text-muted-foreground px-2">
            {String(hour).padStart(2, '0')}
            :00
          </span>
        </div>
      ))}
    </div>
  )
}
