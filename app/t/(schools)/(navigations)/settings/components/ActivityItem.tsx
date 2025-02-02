import React from 'react'

interface ActivityItemProps {
  icon: React.ReactNode
  text: string
  time: string
  device: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  text,
  time,
  device,
}) => {
  return (
    <div className="flex items-center space-x-4">
      {icon}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{text}</p>
        <div className="flex text-xs text-muted-foreground">
          <p>{time}</p>
          <span className="mx-1">•</span>
          <p>{device}</p>
        </div>
      </div>
    </div>
  )
}

export default ActivityItem
