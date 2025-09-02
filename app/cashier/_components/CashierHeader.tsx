'use client'

import { Bell, Calendar, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface CashierUser {
  firstName: string
  lastName: string
  fullName: string
  schoolName: string
  avatarUrl?: string
}

interface CashierHeaderProps {
  user: CashierUser
}

export function CashierHeader({ user }: CashierHeaderProps) {
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
      className="px-6 py-4 border-b border-white/20 backdrop-blur-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center justify-between">
        {/* Welcome Message */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bienvenue,
              {' '}
              {user.firstName}
            </h1>
            <p className="text-white/80 text-sm">
              {user.schoolName}
              {' '}
              - Interface Caisse
            </p>
          </div>
        </div>

        {/* Date, Time, and Actions */}
        <div className="flex items-center space-x-4">
          {/* Date and Time */}
          <div className="hidden md:flex items-center space-x-4 text-white/90">
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

          {/* Notification Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10 relative"
          >
            <Bell className="h-4 w-4" />
            {/* Notification Badge */}
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center"
            >
              3
            </Badge>
          </Button>

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {user.avatarUrl
                ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )
                : (
                    <span className="text-white font-medium text-sm">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  )}
            </div>
            <div className="hidden lg:block text-white">
              <div className="text-sm font-medium">{user.fullName}</div>
              <div className="text-xs opacity-80">Caissier(ère)</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
