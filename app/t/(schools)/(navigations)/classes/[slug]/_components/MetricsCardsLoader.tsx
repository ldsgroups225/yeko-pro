import { getClassDetailsStats } from '@/services/classService'
import { MetricsCards } from './MetricsCard'

interface MetricsCardsLoaderProps {
  classId: string
  schoolId: string
}

// This is an async Server Component
export async function MetricsCardsLoader({ classId, schoolId }: MetricsCardsLoaderProps) {
  // TODO: Fetch schoolYearId and semesterId server-side
  // This might involve creating a server-side version of useSchoolYear or passing them down
  const schoolYearId = 1 // Placeholder - Replace with actual logic
  const semesterId = 1 // Placeholder - Replace with actual logic

  const stats = await getClassDetailsStats({ classId, schoolId, schoolYearId, semesterId })

  // MetricsCards is now a client component that will receive the server-fetched data
  return <MetricsCards stats={stats} />
}
