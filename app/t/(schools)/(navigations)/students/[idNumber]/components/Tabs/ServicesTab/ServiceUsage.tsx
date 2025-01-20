'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Book, Bus, Calendar, Utensils } from 'lucide-react'
import { nanoid } from 'nanoid'

export interface ServiceUsageData {
  id: string
  serviceType: 'transport' | 'cafeteria' | 'library'
  period: string
  usageCount: number
  totalAllowed: number
  lastUsed?: string
  details: {
    date: string
    description: string
  }[]
}

interface ServiceUsageProps {
  usage: ServiceUsageData[]
  isLoading?: boolean
}

const serviceIcons = {
  transport: Bus,
  cafeteria: Utensils,
  library: Book,
}

const serviceLabels = {
  transport: 'Transport',
  cafeteria: 'Cantine',
  library: 'Bibliothèque',
}

function UsageCard({ data }: { data: ServiceUsageData }) {
  const Icon = serviceIcons[data.serviceType]
  const usagePercentage = (data.usageCount / data.totalAllowed) * 100

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">
                {serviceLabels[data.serviceType]}
              </div>
              <div className="text-sm text-muted-foreground">
                {data.period}
              </div>
            </div>
          </div>
          <Badge variant="outline">
            {data.usageCount}
            /
            {data.totalAllowed}
          </Badge>
        </div>

        <div className="space-y-2">
          <Progress
            value={usagePercentage}
            className="h-2"
            aria-label={`${serviceLabels[data.serviceType]} usage progress`}
          />
          {data.lastUsed && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Dernière utilisation:
                {data.lastUsed}
              </span>
            </div>
          )}
        </div>

        {data.details.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Dernières utilisations</div>
            <div className="space-y-2">
              {data.details.slice(0, 3).map(detail => (
                <div
                  key={nanoid()}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {detail.date}
                  </span>
                  <span>{detail.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function UsageCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div>
              <Skeleton className="h-5 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ServiceUsage({ usage, isLoading }: ServiceUsageProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utilisation des Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageCardSkeleton />
          <UsageCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisation des Services</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {usage.map(data => (
          <UsageCard key={data.id} data={data} />
        ))}
      </CardContent>
    </Card>
  )
}
