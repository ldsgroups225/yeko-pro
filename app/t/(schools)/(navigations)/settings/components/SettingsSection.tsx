// components/SettingsSection.tsx
import type { JSX } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  actions?: JSX.Element | JSX.Element[]
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  actions,
  children,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {' '}
          {/* Wrap title in a span for layout consistency */}
          <div>{actions}</div>
          {' '}
          {/*  Keep actions in a container */}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  )
}

export default SettingsSection
