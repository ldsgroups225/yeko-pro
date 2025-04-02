import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/hooks'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useTransition } from 'react'
import { toast } from 'sonner'

interface UserProfileProps {
  expanded: boolean
}

export function UserProfile({ expanded }: UserProfileProps) {
  const [isPending, startTransition] = useTransition()

  const { user, signOut } = useUser()

  const handleLogout = async (): Promise<void> => {
    startTransition(async () => {
      try {
        await signOut()
      }
      catch (error) {
        console.error('Login error:', error)
        toast.error('Une erreur est survenue lors de la connexion.')
      }
    })
  }

  const userInitials = useMemo(() => {
    if (!user?.fullName)
      return 'UN'
    const names = user.fullName.split(' ')
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0].slice(0, 2).toUpperCase()
  }, [user?.fullName])

  return (
    <div className="p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group space-x-2 w-full hover:bg-transparent"
            aria-label="Menu du profil"
          >
            <Avatar className="h-8 w-8 group-hover:scale-110 transition-all duration-300">
              <AvatarImage src="/profile-pic.png" alt={user?.fullName ?? 'Photo de profil'} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            {expanded && <span className="ml-2">{user?.fullName}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href="/profile" className="w-full">
              Voir le profil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full justify-start"
              disabled={isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
