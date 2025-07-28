import { getStudentStats } from '@/services/studentService'
import { QuickStatsGridDisplay } from './QuickStatsGridDisplay'

interface QuickStatsGridProps {
  studentId: string
  semesterId?: number
  className?: string
}

// This is now an async Server Component
export async function QuickStatsGrid({ studentId, semesterId, className = '' }: QuickStatsGridProps) {
  // Fetch data directly within the server component
  // This will implicitly cause the component to suspend if the promise is pending
  const stats = await getStudentStats(studentId, semesterId).catch((error) => {
    console.error('Error fetching student stats:', error)
    // Return null or throw an error to be caught by an ErrorBoundary
    return null
  })

  return <QuickStatsGridDisplay stats={stats} className={className} />
}

// Re-export sub-components if needed elsewhere
export { QuickStatsGridSkeleton } from './QuickStatsGridSkeleton'
export { StatCard } from './StatCard'
