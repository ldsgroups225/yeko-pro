'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUser } from '@/hooks'
import { Calendar, Camera, FileText, GraduationCap, LineChart, Users } from 'lucide-react'
import React from 'react'
import FormField from '../components/FormField'
import SettingsSection from '../components/SettingsSection'

function SchoolSettingsTab() {
  const { user } = useUser()
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Informations de l'établissement"
        description="Gérez les informations principales de votre établissement"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Logo de l'école
            </label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.school?.imageUrl} />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="space-x-2">
                  <Camera className="h-4 w-4" />
                  <span>Changer l'image</span>
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou GIF. Maximum 2MB.
                </p>
              </div>
            </div>
          </div>

          <FormField
            label="Nom de l'établissement"
            id="schoolName"
            defaultValue={user?.school?.name}
            placeholder="Nom de l'établissement"
          />

          <FormField
            label="Code de l'établissement"
            id="schoolCode"
            defaultValue={user?.school?.code}
            placeholder="Code"
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cycle</label>
            <Select defaultValue={user?.school?.cycleId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primaire</SelectItem>
                <SelectItem value="secondary">Secondaire</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsSection>

      <div className="space-y-6">
        <SettingsSection title="Statistiques" description="Aperçu des données de votre établissement">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Classes</span>
              </div>
              <p className="text-2xl font-bold">{user?.school?.classCount}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Élèves</span>
              </div>
              <p className="text-2xl font-bold">{user?.school?.studentCount}</p>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Actions rapides">
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Configurer le calendrier scolaire</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2">
              <FileText className="h-4 w-4" />
              <span>Modèles de bulletins</span>
            </Button>
            <Button variant="outline" className="w-full justify-start space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Rapports analytiques</span>
            </Button>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

export default SchoolSettingsTab
