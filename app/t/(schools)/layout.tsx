'use client'

import { cn } from '@/lib/utils'
import { UserProvider } from '@/providers/UserProvider'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // pathName
  const currentPath = usePathname()
  const isHomePath = currentPath.startsWith('/t/home')

  return (
    <div className={cn('min-h-screen flex flex-col', isHomePath ? '' : 'bg-orange-50')}>
      <header className="shadow-sm sticky top-0 z-10">
        <div className="bg-primary h-3"></div>
        <div className="bg-blue-600 h-9 mx-12 rounded-b-lg"></div>
      </header>

      <Suspense>
        <UserProvider>
          {children}
        </UserProvider>
      </Suspense>
    </div>
  )
}
