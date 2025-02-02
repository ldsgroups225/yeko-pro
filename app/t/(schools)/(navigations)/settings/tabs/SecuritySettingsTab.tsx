'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, Key, Shield } from 'lucide-react'
import { nanoid } from 'nanoid'
import React from 'react'
import ActivityItem from '../components/ActivityItem'
import SettingsSection from '../components/SettingsSection'
import ToggleSetting from '../components/ToggleSetting'

function SecuritySettingsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Sécurité du compte"
        description="Gérez la sécurité de votre compte"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <ToggleSetting
              label="Authentification à deux facteurs"
              description="Ajouter une couche de sécurité supplémentaire"
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Sessions actives</Label>
              <Badge variant="secondary">3 appareils</Badge>
            </div>
            <Button variant="outline" className="w-full justify-start space-x-2">
              <Shield className="h-4 w-4" />
              <span>Gérer les sessions</span>
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Mot de passe</Label>
            <Button variant="outline" className="w-full justify-start space-x-2">
              <Key className="h-4 w-4" />
              <span>Changer le mot de passe</span>
            </Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Journal d'activité"
        description="Historique des dernières activités"
      >
        <CardContent>
          <div className="space-y-4">
            {[
              {
                icon: <CheckCircle className="h-4 w-4 text-green-500" />,
                text: 'Connexion réussie',
                time: 'Il y a 2 minutes',
                device: 'Chrome sur Windows',
              },
              {
                icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
                text: 'Tentative de connexion',
                time: 'Il y a 1 heure',
                device: 'Firefox sur MacOS',
              },
            ].map(activity => (
              <ActivityItem key={nanoid()} {...activity} />
            ))}
          </div>
        </CardContent>
      </SettingsSection>

      <SettingsSection title="Préférences de confidentialité">
        <div className="space-y-4">
          <ToggleSetting
            label="Partage de données"
            description="Autoriser le partage anonyme des statistiques"
            defaultChecked
          />
        </div>
      </SettingsSection>
    </div>
  )
}

export default SecuritySettingsTab
