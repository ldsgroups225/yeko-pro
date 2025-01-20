'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'

interface StudentPageErrorProps {
  error: Error
  reset: () => void
}

export function StudentPageError({ error, reset }: StudentPageErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Une erreur est survenue</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-2">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="mt-2"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
