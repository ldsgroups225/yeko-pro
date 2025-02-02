import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import React from 'react'

interface ToggleSettingProps {
  label: string
  description?: string
  defaultChecked?: boolean
}

const ToggleSetting: React.FC<ToggleSettingProps> = ({
  label,
  description,
  defaultChecked,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-base">{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

export default ToggleSetting
