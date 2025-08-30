import { cache } from 'react'

export interface ConductRecord {
  id: number
  student: string
  class: string
  issue: string
  severity: 'Mineur' | 'Modéré' | 'Sévère'
  date: string
}

// Mock data - replace with actual database queries
async function getRecentConductsFromDatabase(): Promise<ConductRecord[]> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return [
    {
      id: 1,
      student: 'Kouassi Marie',
      class: '6ème A',
      issue: 'Retard répété',
      severity: 'Mineur',
      date: '2024-01-15',
    },
    {
      id: 2,
      student: 'Diabaté Ibrahim',
      class: '5ème B',
      issue: 'Perturbation en classe',
      severity: 'Modéré',
      date: '2024-01-14',
    },
    {
      id: 3,
      student: 'Traoré Fatou',
      class: '4ème C',
      issue: 'Absence non justifiée',
      severity: 'Mineur',
      date: '2024-01-13',
    },
  ]
}

// Cached function for recent conducts
export const getRecentConducts = cache(async (): Promise<ConductRecord[]> => {
  try {
    const conducts = await getRecentConductsFromDatabase()
    return conducts
  }
  catch (error) {
    console.error('Error fetching recent conducts:', error)
    return []
  }
})
