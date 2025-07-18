import type { Student } from './types'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStudentByIdNumber } from '@/services/studentService'
import {
  QuickStatsGrid,
  QuickStatsGridSkeleton,
} from './components/QuickStats'
import { StudentHeader } from './components/StudentHeader'
// Tab Components
import { AttendanceTab } from './components/Tabs/AttendanceTab'
// import { HealthTab } from './components/Tabs/HealthTab'
import { ParentsTab } from './components/Tabs/ParentsTab'
import { PerformanceTab } from './components/Tabs/PerformanceTab'
import { ProfileTab } from './components/Tabs/ProfileTab'
import { transformStudentDTO } from './types'

interface TabConfig {
  id: string
  label: string
  description: string
  component: React.ComponentType<{ student: Student }> | null
  disabled?: boolean
}

// Define available tabs with their configurations
const tabs: TabConfig[] = [
  {
    id: 'profile',
    label: 'Profil',
    description: 'Informations personnelles et services souscrits',
    component: ProfileTab,
  },
  // {
  //   id: 'academic',
  //   label: 'Scolarité',
  //   description: 'Résultats et progression académique',
  //   component: AcademicTab,
  // },
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
  // {
  //   id: 'health',
  //   label: 'Santé',
  //   description: 'Informations médicales et contacts d\'urgence',
  //   component: HealthTab,
  // },
  {
    id: 'parents',
    label: 'Parents',
    description: 'Contacts et communications avec les parents',
    component: ParentsTab,
  },
]

export default async function StudentPage({
  params,
}: {
  params: Promise<{ idNumber: string }>
}) {
  // Await the params object before using it
  const { idNumber } = await params

  // Fetch student data server-side
  const studentDTO = await getStudentByIdNumber(idNumber).catch((error) => {
    console.error('Failed to fetch student:', error)
    return null
  })

  if (!studentDTO) {
    notFound()
  }

  const student = transformStudentDTO(studentDTO)

  return (
    <div className="space-y-6 md:p-6">
      {/* Header Section */}
      <StudentHeader student={student} />

      {/* Quick Stats Overview - Wrapped in Suspense */}
      <Suspense fallback={<QuickStatsGridSkeleton />}>
        <QuickStatsGrid studentId={student.id} />
      </Suspense>

      {/* Main Content Tabs */}
      <Tabs defaultValue={tabs[0].id} className="space-y-6">
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
            {tab.component && (
              <tab.component student={student} />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
