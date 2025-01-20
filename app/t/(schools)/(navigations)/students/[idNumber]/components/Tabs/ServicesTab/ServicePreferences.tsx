'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Bell, Clock, MapPin, Settings } from 'lucide-react'
import { useCallback } from 'react'

export interface ServicePreference {
  id: string
  serviceId: string
  serviceName: string
  settingType: 'toggle' | 'select' | 'time'
  label: string
  description: string
  currentValue: string
  options?: {
    value: string
    label: string
  }[]
  category: 'notifications' | 'schedule' | 'location' | 'general'
}

interface ServicePreferencesProps {
  preferences: ServicePreference[]
  onUpdatePreference: (preferenceId: string, value: string) => void
  isLoading?: boolean
}

const categoryIcons = {
  notifications: Bell,
  schedule: Clock,
  location: MapPin,
  general: Settings,
}

const categoryLabels = {
  notifications: 'Notifications',
  schedule: 'Horaires',
  location: 'Localisation',
  general: 'Général',
}

function PreferenceControl({ preference, onUpdate }: {
  preference: ServicePreference
  onUpdate: (value: string) => void
}) {
  const handleToggleChange = useCallback((checked: boolean) => {
    onUpdate(checked ? 'true' : 'false')
  }, [onUpdate])

  switch (preference.settingType) {
    case 'toggle':
      return (
        <Switch
          checked={preference.currentValue === 'true'}
          onCheckedChange={handleToggleChange}
          aria-label={preference.label}
        />
      )
    case 'select':
      return (
        <Select
          value={preference.currentValue}
          onValueChange={onUpdate}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner..." />
          </SelectTrigger>
          <SelectContent>
            {preference.options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    case 'time':
      return (
        <Select
          value={preference.currentValue}
          onValueChange={onUpdate}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Choisir un horaire" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 24 }).map((_, i) => {
              const time = `${i.toString().padStart(2, '0')}:00`
              return (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      )
    default:
      return null
  }
}

function PreferenceRow({ preference, onUpdate }: {
  preference: ServicePreference
  onUpdate: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex-1">
        <Label htmlFor={preference.id} className="font-medium">
          {preference.label}
        </Label>
        <p className="text-sm text-muted-foreground">
          {preference.description}
        </p>
      </div>
      <PreferenceControl
        preference={preference}
        onUpdate={onUpdate}
      />
    </div>
  )
}

function PreferenceRowSkeleton() {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-[200px]" />
    </div>
  )
}

export function ServicePreferences({
  preferences,
  onUpdatePreference,
  isLoading,
}: ServicePreferencesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Préférences des Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-6">
                <PreferenceRowSkeleton />
                <PreferenceRowSkeleton />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Group preferences by category
  const preferencesByCategory = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = []
    }
    acc[pref.category].push(pref)
    return acc
  }, {} as Record<string, ServicePreference[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences des Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(preferencesByCategory).map(([category, prefs]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-medium">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
              </div>
              <div className="space-y-6">
                {prefs.map(preference => (
                  <PreferenceRow
                    key={preference.id}
                    preference={preference}
                    onUpdate={value => onUpdatePreference(preference.id, value)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
