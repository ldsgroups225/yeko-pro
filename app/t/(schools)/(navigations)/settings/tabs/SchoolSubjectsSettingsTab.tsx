'use client'

import { useEffect } from 'react'
import SchoolSubjectsManager from '@/components/SchoolSubjectsManager'
import { useSchoolYear, useUser } from '@/hooks'
import SettingsSection from '../components/SettingsSection'

function SchoolSubjectsSettingsTab() {
  const { user } = useUser()
  const { loadSchoolYears } = useSchoolYear()

  useEffect(() => {
    // Load school years on component mount
    loadSchoolYears()
  }, []) // Remove loadSchoolYears dependency to avoid infinite loop

  if (!user?.school) {
    return (
      <div className="space-y-6">
        <SettingsSection
          title="Gestion des Matières Scolaires"
          description="Configurez les matières enseignées dans votre établissement pour chaque année scolaire"
        >
          <div className="text-center py-8 text-muted-foreground">
            <p>Impossible de charger les informations de l'école</p>
          </div>
        </SettingsSection>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Gestion des Matières Scolaires"
        description="Configurez les matières enseignées dans votre établissement pour chaque année scolaire"
      >
        <SchoolSubjectsManager
          schoolId={user.school.id}
          schoolName={user.school.name}
        />
      </SettingsSection>
    </div>
  )
}

export default SchoolSubjectsSettingsTab
