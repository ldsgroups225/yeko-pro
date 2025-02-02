'use client'

import { CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import SettingsSection from '../components/SettingsSection'
import ToggleSetting from '../components/ToggleSetting'

function NotificationsSettingsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Préférences de notification"
        description="Configurez comment vous souhaitez être notifié"
      >
        <div className="space-y-6">
          <ToggleSetting
            label="Notifications par email"
            description="Recevoir des notifications par email"
            defaultChecked
          />
          <Separator />
          <ToggleSetting
            label="Notifications SMS"
            description="Recevoir des notifications par SMS"
          />
          <Separator />
          <ToggleSetting
            label="Notifications push"
            description="Recevoir des notifications push"
            defaultChecked
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Types de notifications"
        description="Choisissez les événements pour lesquels vous souhaitez être notifié"
      >
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox id="absences" />
              <div className="space-y-1">
                <Label htmlFor="absences">Absences</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications des absences d'élèves
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-4">
              <Checkbox id="grades" defaultChecked />
              <div className="space-y-1">
                <Label htmlFor="grades">Notes</Label>
                <p className="text-sm text-muted-foreground">
                  Publication des notes
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center space-x-4">
              <Checkbox id="events" defaultChecked />
              <div className="space-y-1">
                <Label htmlFor="events">Événements</Label>
                <p className="text-sm text-muted-foreground">
                  Événements scolaires et réunions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </SettingsSection>
    </div>
  )
}

export default NotificationsSettingsTab
