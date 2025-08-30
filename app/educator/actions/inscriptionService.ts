import { cache } from 'react'

export interface PendingInscription {
  id: number
  student: string
  parent: string
  class: string
  status: string
  date: string
}

// Mock data - replace with actual database queries
async function getPendingInscriptionsFromDatabase(): Promise<PendingInscription[]> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return [
    {
      id: 1,
      student: 'N\'Guessan Paul',
      parent: 'N\'Guessan Jean',
      class: '6ème',
      status: 'En attente',
      date: '2024-01-10',
    },
    {
      id: 2,
      student: 'Bamba Aïcha',
      parent: 'Bamba Salif',
      class: '5ème',
      status: 'Documents manquants',
      date: '2024-01-09',
    },
  ]
}

// Cached function for pending inscriptions
export const getPendingInscriptions = cache(async (): Promise<PendingInscription[]> => {
  try {
    const inscriptions = await getPendingInscriptionsFromDatabase()
    return inscriptions
  }
  catch (error) {
    console.error('Error fetching pending inscriptions:', error)
    return []
  }
})
