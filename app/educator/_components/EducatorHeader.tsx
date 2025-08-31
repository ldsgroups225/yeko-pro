'use client'

import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '../stores'

export function EducatorHeader() {
  const router = useRouter()
  // Use shallow comparison to prevent unnecessary re-renders
  const user = useUserStore(useShallow(state => state.user))

  const handleLogout = async () => {
    try {
      // Import the signOut function dynamically to avoid SSR issues
      const { signOut } = await import('@/services/userService')
      await signOut()
      router.push('/sign-in')
    }
    catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const handleProfile = () => {
    // Navigate to profile page (you can adjust the route as needed)
    router.push('/educator/profile')
  }

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-4 p-2 h-auto">
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
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleProfile}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>
    </header>
  )
}
