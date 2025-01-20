'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Bell, Mail, MessageSquare, Phone } from 'lucide-react'

export interface CommunicationChannel {
  id: string
  type: 'sms' | 'email' | 'whatsapp' | 'call'
  enabled: boolean
  recipientId: string
  preferredTime?: string
  language?: string
}

export interface NotificationPreference {
  id: string
  type: string
  description: string
  channels: ('sms' | 'email' | 'whatsapp' | 'call')[]
  enabled: boolean
}

interface CommunicationPreferencesProps {
  channels: CommunicationChannel[]
  notifications: NotificationPreference[]
  onToggleChannel: (channelId: string, enabled: boolean) => void
  onToggleNotification: (notificationId: string, enabled: boolean) => void
  onUpdateChannel: (channelId: string, updates: Partial<CommunicationChannel>) => void
  isLoading?: boolean
}

const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
]

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
]

function ChannelIcon({ type }: { type: string }) {
  switch (type) {
    case 'sms':
      return <MessageSquare className="h-4 w-4" />
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'whatsapp':
      return <MessageSquare className="h-4 w-4 text-green-500" />
    case 'call':
      return <Phone className="h-4 w-4" />
    default:
      return null
  }
}

function PreferenceRow({
  preference,
  onToggle,
}: {
  preference: NotificationPreference
  onToggle: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between space-x-4">
      <div>
        <Label className="font-medium">
          {preference.type}
        </Label>
        <p className="text-sm text-muted-foreground">
          {preference.description}
        </p>
        <div className="flex gap-2 mt-1">
          {preference.channels.map(channel => (
            <ChannelIcon key={channel} type={channel} />
          ))}
        </div>
      </div>
      <Switch
        checked={preference.enabled}
        onCheckedChange={onToggle}
        aria-label={`Toggle ${preference.type}`}
      />
    </div>
  )
}

function ChannelSettings({
  channel,
  onToggle,
  onUpdate,
}: {
  channel: CommunicationChannel
  onToggle: (enabled: boolean) => void
  onUpdate: (updates: Partial<CommunicationChannel>) => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChannelIcon type={channel.type} />
          <Label className="font-medium capitalize">
            {channel.type}
          </Label>
        </div>
        <Switch
          checked={channel.enabled}
          onCheckedChange={onToggle}
          aria-label={`Toggle ${channel.type}`}
        />
      </div>

      {channel.enabled && (
        <div className="ml-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Horaire préféré</Label>
            <Select
              value={channel.preferredTime}
              onValueChange={value => onUpdate({ preferredTime: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un horaire" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Langue</Label>
            <Select
              value={channel.language}
              onValueChange={value => onUpdate({ language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une langue" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-5 w-32 mb-2" />
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-11 rounded-full" />
              </div>
              <div className="ml-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CommunicationPreferences({
  channels,
  notifications,
  onToggleChannel,
  onToggleNotification,
  onUpdateChannel,
  isLoading,
}: CommunicationPreferencesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Préférences de Communication</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences de Communication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
            <Bell className="h-4 w-4" />
            Notifications
          </h3>
          <div className="space-y-6">
            {notifications.map(pref => (
              <PreferenceRow
                key={pref.id}
                preference={pref}
                onToggle={enabled => onToggleNotification(pref.id, enabled)}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-4">Canaux de Communication</h3>
          <div className="space-y-6">
            {channels.map(channel => (
              <ChannelSettings
                key={channel.id}
                channel={channel}
                onToggle={enabled => onToggleChannel(channel.id, enabled)}
                onUpdate={updates => onUpdateChannel(channel.id, updates)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
