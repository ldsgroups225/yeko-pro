'use client'

import { usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'
import { UserProvider } from '@/providers/UserProvider'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // pathName
  const currentPath = usePathname()
  const isHomePath = currentPath.startsWith('/t/home')

  return (
    <div className={cn('flex flex-col', isHomePath ? '' : 'bg-orange-50')}>
      <Suspense>
        <UserProvider>
          {children}
        </UserProvider>
      </Suspense>
    </div>
  )
}
