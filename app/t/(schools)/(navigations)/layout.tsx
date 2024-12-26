'use client'

import { ModeToggle } from '@/components/ModeToggle'
import { SchoolYearSelector } from '@/components/SchoolYearSelector'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar, BreadcrumbNav } from '../(navigations)/_components'

export default function NavigationLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      className="flex w-full"
      style={{
        ['--sidebar-width-mobile' as string]: '20rem',
      }}
    >
      <AppSidebar />

      <main className="flex flex-col w-full bg-orange-50">
        <header className="shadow-sm sticky top-0 z-10">
          <div className="bg-primary h-3"></div>
          <div className="bg-blue-600 h-9 mx-12 rounded-b-lg"></div>
        </header>

        <div className="flex flex-col h-full overflow-y-auto py-4 px-6">
          <div className="flex items-center justify-between px-6">
            <BreadcrumbNav />

            <div className="flex items-center space-x-2">
              <ModeToggle textColor="text-secondary" />
              <SchoolYearSelector onYearChange={() => {}} />
            </div>
          </div>

          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
