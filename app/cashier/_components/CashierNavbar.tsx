'use client'

import {
  Calendar,
  Clock,
  FileText,
  LogOut,
  PlusCircle,
  Search,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import useUserStore from '@/store/userStore'

interface CashierNavbarProps {
  onNewPayment: () => void
  onSearchStudent: () => void
  onGenerateReport: () => void
}

export function CashierNavbar({
  onNewPayment,
  onSearchStudent,
  onGenerateReport,
}: CashierNavbarProps) {
  const router = useRouter()
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
    router.push('/cashier/profile')
  }

  if (!user) {
    router.replace('/sign-in')
    return null
  }

  const currentDate = new Date()
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <header
      className="px-4 md:px-6 py-4 border-b border-border/30 backdrop-blur-lg bg-card/20 shadow-glass-subtle"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left Side - Title and Welcome */}
        <div className="flex items-center space-x-4 md:space-x-6">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-foreground">
              Tableau de Bord Caisse
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm hidden sm:block">
              {user.school.name}
            </p>
          </div>
        </div>

        {/* Center - Action Buttons */}
        <div className="flex items-center space-x-1 md:space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSearchStudent}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent/20 backdrop-blur-sm h-10 w-10 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rechercher un étudiant par nom ou matricule</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onNewPayment}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent/20 backdrop-blur-sm h-10 w-10 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enregistrer un nouveau paiement</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onGenerateReport}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-accent/20 backdrop-blur-sm h-10 w-10 p-0 md:h-auto md:w-auto md:px-3 md:py-2"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Générer le rapport de fin de journée</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Right Side - Date, Time, Notifications, User */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Date and Time */}
          <div className="hidden lg:flex items-center space-x-4 text-foreground/90">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatDate(currentDate)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatTime(currentDate)}
              </span>
            </div>
          </div>

          {/* Mobile Date/Time */}
          <div className="lg:hidden flex items-center space-x-2 text-foreground/90">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {currentDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatDate(currentDate)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 md:gap-3 p-1 md:p-2 h-auto text-foreground hover:bg-accent/20 backdrop-blur-sm">
                <Avatar className="h-8 w-8 md:h-10 md:w-10">
                  <AvatarImage
                    src={user?.avatarUrl || '/user_placeholder.png'}
                    alt={user?.fullName || 'Utilisateur'}
                  />
                  <AvatarFallback className="bg-primary/20 text-primary-foreground font-semibold text-xs md:text-sm">
                    {user?.fullName
                      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                      : 'CA'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <div className="text-sm font-medium">{user?.fullName || 'Caissier'}</div>
                  <div className="text-xs opacity-80">Caissier(ère)</div>
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
      </div>
    </header>
  )
}
