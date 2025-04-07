// app/t/(schools)/(navigations)/dashboard/_components/Applications.tsx
'use client'

import type { IApplicationsProps, ICandidature } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTimePassed } from '@/lib/utils'
import { handleCandidature } from '@/services/dashboardService'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

type TAction = 'accept' | 'reject'

interface ApplicationActionPayload {
  application: ICandidature
  action: TAction
}

export function Applications({ applications }: IApplicationsProps) {
  const [pendingRemovals, setPendingRemovals] = useState<string[]>([])
  const [isUpdating, startTransition] = useTransition()

  const optimisticSubmitAction = async (payload: ApplicationActionPayload) => {
    startTransition(async () => {
      try {
        await handleCandidature(
          payload.application.candidateId,
          payload.application.type as 'student' | 'teacher',
          payload.action,
        )
        toast.success('Candidature mise à jour')
      }
      catch (error) {
        console.error(`Error ${payload.action}ing application:`, error)
        toast.error('Une erreur est survenue lors de l\'action sur la candidature.')
        setPendingRemovals(prev => prev.filter(id => id !== payload.application.candidateId))
      }
    })
  }

  const submitAction = async (payload: ApplicationActionPayload) => {
    setPendingRemovals(prev => [...prev, payload.application.candidateId])
    await optimisticSubmitAction(payload).catch(() => {
      setPendingRemovals(prev => prev.filter(id => id !== payload.application.candidateId))
    })
  }

  const accept = async (application: ICandidature) => {
    await submitAction({ application, action: 'accept' })
  }

  const reject = async (application: ICandidature) => {
    await submitAction({ application, action: 'reject' })
  }

  const displayedApplications = applications.filter(
    app => !pendingRemovals.includes(app.candidateId),
  )

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Récentes Candidatures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedApplications.map(application => (
            <div
              key={application.candidateId}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  {formatTimePassed(new Date(application.time))}
                </div>
                <div>
                  <div className="font-medium">{application.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {application.type === 'student' ? 'Élève' : 'Professeur'}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating || pendingRemovals.includes(application.candidateId)}
                  onClick={() => accept(application)}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating || pendingRemovals.includes(application.candidateId)}
                  onClick={() => reject(application)}
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  Rejeter
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default Applications
