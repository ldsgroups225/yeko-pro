'use client'

import { UserProvider } from '@/providers/UserProvider'

interface Props {
  children: React.ReactNode
}

export function EducatorLayoutClient({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-background">
      <UserProvider>
        {children}
      </UserProvider>
    </div>
  )
}
