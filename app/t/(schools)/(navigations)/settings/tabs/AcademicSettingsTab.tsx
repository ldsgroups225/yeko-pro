'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import React from 'react'
import SettingsSection from '../components/SettingsSection'
import ToggleSetting from '../components/ToggleSetting'

function AcademicSettingsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SettingsSection
        title="Configuration académique"
        description="Gérez les paramètres académiques de votre établissement"
      >
        <div className="space-y-6">
          <ToggleSetting
            label="Système de notation"
            description="Définir l'échelle de notation"
          />
          <Separator />
          <ToggleSetting
            label="Périodes scolaires"
            description="Gérer les trimestres/semestres"
          />
          <Separator />
          <ToggleSetting
            label="Emploi du temps"
            description="Configuration des horaires"
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Paramètres d'évaluation"
        description="Configurez les règles d'évaluation"
      >
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Barème par défaut</label>
              <Select defaultValue="20">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un barème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">Sur 20</SelectItem>
                  <SelectItem value="10">Sur 10</SelectItem>
                  <SelectItem value="100">Sur 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}

export default AcademicSettingsTab
