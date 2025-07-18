'use client'

import { nanoid } from 'nanoid'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import IntegrationItem from '../components/IntegrationItem'
import SettingsSection from '../components/SettingsSection'

function IntegrationsSettingsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Services connectés"
        description="Gérez vos intégrations et services externes"
      >
        <div className="space-y-4">
          {[
            {
              name: 'Google Workspace',
              description: 'Synchronisation avec Google Classroom',
              connected: true,
            },
            {
              name: 'Microsoft 365',
              description: 'Synchronisation avec Teams Education',
              connected: false,
            },
            {
              name: 'Zoom Education',
              description: 'Classes virtuelles',
              connected: true,
            },
          ].map(service => (
            <IntegrationItem key={nanoid()} {...service} />
          ))}
        </div>
      </SettingsSection>

      <SettingsSection
        title="API et développeurs"
        description="Gérez l'accès API et les clés de développement"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Clé API</Label>
            <div className="flex space-x-2">
              <Input type="password" value="sk_live_..." readOnly />
              <Button variant="outline">
                Copier
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input placeholder="https://api.votresite.com/webhook" />
          </div>
          <Button className="w-full" variant="outline">
            Générer nouvelle clé API
          </Button>
        </div>
      </SettingsSection>
    </div>
  )
}

export default IntegrationsSettingsTab
