import { cache } from 'react'

export interface User {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  role: string
}

// Mock data - replace with actual database queries
async function getCurrentUserFromDatabase(): Promise<User | null> {
  // Simulate database delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return {
    id: 'user-123',
    full_name: 'Mme. Kouamé Adjoua',
    email: 'kouame.adjoua@school.ci',
    avatar_url: '/user_placeholder.png',
    role: 'educator',
  }
}

// Cached function for current user
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const user = await getCurrentUserFromDatabase()
    return user
  }
  catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
})
