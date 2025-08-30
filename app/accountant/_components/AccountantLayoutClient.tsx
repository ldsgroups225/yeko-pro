'use client'

import { UserProvider } from '@/providers/UserProvider'

interface Props {
  children: React.ReactNode
}

export function AccountantLayoutClient({ children }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserProvider>
        <main className="container mx-auto py-8">
          {children}
        </main>
      </UserProvider>
    </div>
  )
}
