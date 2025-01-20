'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import consola from 'consola'
import { Bus, Utensils } from 'lucide-react'

export interface Service {
  id: string
  name: string
  icon: React.ReactNode
  isActive: boolean
  onToggle: (checked: boolean) => void
}

interface SubscribedServicesProps {
  services: Service[]
  isLoading?: boolean
}

function ServiceRow({ service }: { service: Service }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {service.icon}
        <span>{service.name}</span>
      </div>
      <Switch
        checked={service.isActive}
        onCheckedChange={service.onToggle}
        aria-label={`Toggle ${service.name}`}
      />
    </div>
  )
}

function SubscribedServicesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map(index => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-10" />
        </div>
      ))}
    </div>
  )
}

export function SubscribedServices({ services, isLoading }: SubscribedServicesProps) {
  // Default services if none provided
  const defaultServices: Service[] = [
    {
      id: 'transport',
      name: 'Transport Scolaire',
      icon: <Bus className="h-5 w-5 text-muted-foreground" />,
      isActive: false,
      onToggle: () => consola.log('Transport toggled'),
    },
    {
      id: 'cafeteria',
      name: 'Cantine',
      icon: <Utensils className="h-5 w-5 text-muted-foreground" />,
      isActive: false,
      onToggle: () => consola.log('Cafeteria toggled'),
    },
  ]

  const displayedServices = services.length > 0 ? services : defaultServices

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Souscrits</CardTitle>
        <CardDescription>État des services optionnels</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading
          ? (
              <SubscribedServicesSkeleton />
            )
          : (
              <div className="space-y-4">
                {displayedServices.map(service => (
                  <ServiceRow key={service.id} service={service} />
                ))}
              </div>
            )}
      </CardContent>
    </Card>
  )
}
