'use client'

import type { IApplicationsProps } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { nanoid } from 'nanoid'

export function Applications({ applications }: IApplicationsProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">Récentes Candidatures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map(application => (
            <div
              key={nanoid()}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                  {application.time}
                </div>
                <div>
                  <div className="font-medium">{application.name}</div>
                  <div className="text-sm text-muted-foreground">{application.type}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
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
