'use client'

import Image from 'next/image'
import { useShallow } from 'zustand/react/shallow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useUserStore } from '../stores'

export function EducatorHeader() {
  // Use shallow comparison to prevent unnecessary re-renders
  const user = useUserStore(useShallow(state => state.user))

  return (
    <header className="bg-gradient-to-br from-background/50 to-background border-b">
      <div className="container mx-auto px-6 py-6">
        <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center">
                  <Image
                    priority
                    src={user?.school.imageUrl || '/logo.png'}
                    alt={user?.school.name || 'School Logo'}
                    className="size-12"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-primary">Panneau Éducateur</h1>
                  <p className="text-muted-foreground">{user?.school.name || 'École Primaire et Secondaire - Côte d\'Ivoire'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatarUrl || '/user_placeholder.png'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ED'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{user?.fullName || 'Éducateur'}</p>
                  <p className="text-sm text-muted-foreground">Éducateur</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </header>
  )
}
