'use client'

import { Mail, Smartphone } from 'lucide-react'
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser } from '@/hooks'
import { ERole } from '@/types'
import FormField from '../components/FormField'
import SettingsSection from '../components/SettingsSection'

function ProfileSettingsTab() {
  const { user } = useUser()
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Informations personnelles"
        description="Gérez vos informations personnelles"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Prénom"
              id="firstName"
              defaultValue={user?.firstName}
              placeholder="Prénom"
            />
            <FormField
              label="Nom"
              id="lastName"
              defaultValue={user?.lastName}
              placeholder="Nom"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <Select defaultValue={user?.roleId.toString()} disabled onValueChange={() => {}}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ERole.DIRECTOR.toString()}>Directeur</SelectItem>
                <SelectItem value={ERole.EDUCATOR.toString()}>Éducateur</SelectItem>
                <SelectItem value={ERole.TEACHER.toString()}>Enseignant</SelectItem>
                <SelectItem value={ERole.ACCOUNTANT.toString()}>Comptable</SelectItem>
                <SelectItem value={ERole.CASHIER.toString()}>Caissier</SelectItem>
                <SelectItem value={ERole.HEADMASTER.toString()}>Proviseur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Contact"
        description="Gérez vos informations de contact"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            </div>
            <FormField
              label="Email"
              id="email"
              type="email"
              defaultValue={user?.email}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
            </div>
            <FormField
              label="Téléphone"
              id="phone"
              type="tel"
              defaultValue={user?.phoneNumber}
              placeholder="+123456789"
            />
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}

export default ProfileSettingsTab
