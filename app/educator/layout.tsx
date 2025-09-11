'use client'

import { redirect } from 'next/navigation'
import { UserProvider } from '@/providers/UserProvider'
import useUserStore from '@/store/userStore'
import { ERole } from '@/types'
import { EducatorHeader } from './_components/EducatorHeader'

interface Props {
  children: React.ReactNode
}

export default function EducatorLayout({ children }: Props) {
  const { user } = useUserStore()

  if (user) {
    if (user.roleId !== ERole.EDUCATOR) {
      return redirect('/unauthorized')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background/50 to-background">
      <UserProvider>
        <EducatorHeader />

        <main className="container mx-auto px-6 py-8">
          <div className="space-y-8">
            {/* <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-primary">
                Tableau de Bord
              </h2>
              <p className="text-muted-foreground">
                Bienvenue dans votre espace éducateur
              </p>
            </div> */}

            {children}
          </div>
        </main>
      </UserProvider>
    </div>
  )
}
