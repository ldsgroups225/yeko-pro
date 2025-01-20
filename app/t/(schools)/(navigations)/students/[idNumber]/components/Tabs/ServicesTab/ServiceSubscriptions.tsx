'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Book, Bus, Heart, Utensils } from 'lucide-react'

export interface ServiceSubscription {
  id: string
  name: string
  type: 'transport' | 'cafeteria' | 'library' | 'health'
  description: string
  isActive: boolean
  startDate?: string
  endDate?: string
  cost: {
    amount: number
    period: 'month' | 'term' | 'year'
  }
  settings?: {
    id: string
    label: string
    value: string
  }[]
}

interface ServiceSubscriptionsProps {
  services: ServiceSubscription[]
  onToggleService: (serviceId: string, active: boolean) => void
  isLoading?: boolean
}

const serviceIcons = {
  transport: Bus,
  cafeteria: Utensils,
  library: Book,
  health: Heart,
}

function ServiceCard({ service, onToggle }: {
  service: ServiceSubscription
  onToggle: (active: boolean) => void
}) {
  const Icon = serviceIcons[service.type]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-muted-foreground">
                {service.description}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={service.isActive ? 'default' : 'secondary'}>
                  {service.cost.amount.toLocaleString('fr-FR')}
                  {' '}
                  FCFA/
                  {service.cost.period}
                </Badge>
                {service.startDate && (
                  <span className="text-sm text-muted-foreground">
                    Depuis le
                    {' '}
                    {service.startDate}
                  </span>
                )}
              </div>
              {service.settings && service.settings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {service.settings.map(setting => (
                    <div key={setting.id} className="text-sm">
                      <span className="text-muted-foreground">
                        {setting.label}
                        :
                      </span>
                      {' '}
                      <span>{setting.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Switch
            checked={service.isActive}
            onCheckedChange={onToggle}
            aria-label={`Toggle ${service.name}`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ServiceCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-11 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ServiceSubscriptions({
  services,
  onToggleService,
  isLoading,
}: ServiceSubscriptionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services Disponibles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun service disponible
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const activeServices = services.filter(s => s.isActive)
  const inactiveServices = services.filter(s => !s.isActive)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Services Disponibles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeServices.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-green-500">Services Actifs</h3>
            {activeServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onToggle={active => onToggleService(service.id, active)}
              />
            ))}
          </div>
        )}

        {inactiveServices.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Services Disponibles
            </h3>
            {inactiveServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onToggle={active => onToggleService(service.id, active)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
