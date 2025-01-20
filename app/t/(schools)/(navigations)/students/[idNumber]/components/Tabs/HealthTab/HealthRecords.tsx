'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileCheck, Stethoscope, Syringe } from 'lucide-react'

export interface HealthRecord {
  id: string
  type: 'checkup' | 'vaccination' | 'incident'
  title: string
  date: string
  provider?: string
  description: string
  nextDue?: string
  attachments?: number
}

interface HealthRecordsProps {
  records: HealthRecord[]
  isLoading?: boolean
}

const recordTypeIcons = {
  checkup: Stethoscope,
  vaccination: Syringe,
  incident: FileCheck,
}

const recordTypeLabels = {
  checkup: 'Visite médicale',
  vaccination: 'Vaccination',
  incident: 'Incident',
}

function RecordCard({ record }: { record: HealthRecord }) {
  const Icon = recordTypeIcons[record.type]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{record.title}</div>
                <div className="text-sm text-muted-foreground">
                  {record.date}
                  {record.provider && ` • ${record.provider}`}
                </div>
              </div>
              <Badge variant="outline">
                {recordTypeLabels[record.type]}
              </Badge>
            </div>
            <p className="mt-2 text-sm">
              {record.description}
            </p>
            <div className="mt-2 flex items-center gap-4">
              {record.nextDue && (
                <span className="text-sm text-muted-foreground">
                  Prochaine échéance:
                  {' '}
                  {record.nextDue}
                </span>
              )}
              {record.attachments && (
                <span className="text-sm text-muted-foreground">
                  {record.attachments}
                  {' '}
                  document
                  {record.attachments > 1 ? 's' : ''}
                  {' '}
                  joint
                  {record.attachments > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecordCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <div className="mt-2 flex items-center gap-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HealthRecords({ records, isLoading }: HealthRecordsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique Médical</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Group records by year
  const recordsByYear = records.reduce((acc, record) => {
    const year = record.date.split('/').pop()
    if (!year)
      return acc
    if (!acc[year])
      acc[year] = []
    acc[year].push(record)
    return acc
  }, {} as Record<string, HealthRecord[]>)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique Médical</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(recordsByYear)
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, yearRecords]) => (
            <div key={year} className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                {year}
              </h3>
              <div className="space-y-4">
                {yearRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(record => (
                    <RecordCard key={record.id} record={record} />
                  ))}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
