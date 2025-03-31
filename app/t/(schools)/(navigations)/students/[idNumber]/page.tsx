'use client'

import type { Student, StudentStats } from './types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useStudents } from '@/hooks'
import { usePathname } from 'next/navigation'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { QuickStatsGrid } from './components/QuickStats'

import { StudentHeader } from './components/StudentHeader'
import { StudentPageError } from './components/StudentPageError'
// Tab Components
import { AcademicTab } from './components/Tabs/AcademicTab'

import { AttendanceTab } from './components/Tabs/AttendanceTab'
import { HealthTab } from './components/Tabs/HealthTab'
import { ParentsTab } from './components/Tabs/ParentsTab'
import { PaymentsTab } from './components/Tabs/PaymentsTab'
import { PerformanceTab } from './components/Tabs/PerformanceTab'
import { ProfileTab } from './components/Tabs/ProfileTab'
import { ServicesTab } from './components/Tabs/ServicesTab'
import { transformStudentDTO } from './types'

// Mock data - Move to API calls later
const mockStats: StudentStats = {
  attendance: 95,
  average: 15.5,
  payment: {
    status: 'up_to_date',
    percentage: 100,
  },
  behavior: {
    status: 'Bien',
    score: 90,
  },
}

interface TabConfig {
  id: string
  label: string
  description: string
  component: React.ComponentType<{ student: Student, isLoading?: boolean }> | null
  disabled?: boolean
}

export default function StudentPage() {
  const pathname = usePathname()
  const idNumber = pathname.split('/').pop()

  const { isLoading, error: apiError, fetchStudentByIdNumber, selectedStudent: studentDTO } = useStudents()
  const [error, setError] = useState<Error | null>(null)
  const [student, setStudent] = useState<Student | undefined>(undefined)

  // Define available tabs with their configurations
  const tabs = useMemo<TabConfig[]>(() => [
    {
      id: 'profile',
      label: 'Profil',
      description: 'Informations personnelles et services souscrits',
      component: ProfileTab,
    },
    {
      id: 'academic',
      label: 'Scolarité',
      description: 'Résultats et progression académique',
      component: AcademicTab,
    },
    {
      id: 'attendance',
      label: 'Présence',
      description: 'Suivi des présences et absences',
      component: AttendanceTab,
    },
    {
      id: 'performance',
      label: 'Performance',
      description: 'Analyse détaillée des performances',
      component: PerformanceTab,
    },
    {
      id: 'health',
      label: 'Santé',
      description: 'Informations médicales et contacts d\'urgence',
      component: HealthTab,
    },
    {
      id: 'payments',
      label: 'Paiements',
      description: 'État des paiements et historique',
      component: PaymentsTab,
    },
    {
      id: 'services',
      label: 'Services',
      description: 'Gestion des services optionnels',
      component: ServicesTab,
    },
    {
      id: 'parents',
      label: 'Parents',
      description: 'Contacts et communications avec les parents',
      component: ParentsTab,
    },
  ], [])

  // Track active tab
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  // Fetch student data
  useEffect(() => {
    async function getStudent(idNumber: string) {
      try {
        await fetchStudentByIdNumber(idNumber)
      }
      catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch student'))
      }
    }

    if (idNumber) {
      getStudent(idNumber)
    }
  }, [idNumber, fetchStudentByIdNumber])

  // Transform DTO to internal type when it changes
  useEffect(() => {
    if (studentDTO) {
      setStudent(transformStudentDTO(studentDTO))
    }
  }, [studentDTO])

  // Handle errors
  if (error || apiError) {
    return (
      <StudentPageError
        error={error || new Error(apiError || 'An unknown error occurred')}
        reset={() => {
          setError(null)
          if (idNumber)
            fetchStudentByIdNumber(idNumber)
        }}
      />
    )
  }

  return (
    <div className="space-y-6 md:p-6">
      {/* Header Section */}
      <StudentHeader student={student} isLoading={isLoading} />

      {/* Quick Stats Overview */}
      <QuickStatsGrid stats={!isLoading ? mockStats : undefined} isLoading={isLoading} />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <div className="flex h-auto p-1 w-full md:w-auto">
          <TabsList className="flex h-auto p-1 w-full md:w-auto overflow-x-auto md:overflow-visible">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 md:flex-none"
                disabled={tab.disabled || !tab.component}
                title={tab.description}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map(tab => (
          <TabsContent key={tab.id} value={tab.id}>
            {student && tab.component && (
              <tab.component student={student} isLoading={isLoading} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
