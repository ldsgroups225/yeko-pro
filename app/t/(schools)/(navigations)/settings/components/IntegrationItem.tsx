import React from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface IntegrationItemProps {
  name: string
  description: string
  connected: boolean
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({
  name,
  description,
  connected,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{name}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={connected} />
    </div>
  )
}

export default IntegrationItem
