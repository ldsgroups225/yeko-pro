'use client'

import type { IGrade, ISubject } from '@/types'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ImportIcon, PlusIcon, RefreshCcwIcon } from 'lucide-react'
import { useState } from 'react'
import { ImportProgressReportsDialog } from './ImportProgressReportsDialog'
import { ProgressReportDialog } from './ProgressReportDialog'

interface ProgressReportActionsProps {
  grades: IGrade[]
  subjects: ISubject[]
  schoolYearId: number
  refresh: () => Promise<void>
}

export function ProgressReportActions({ grades, subjects, schoolYearId, refresh }: ProgressReportActionsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={refresh}>
              <RefreshCcwIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Actualiser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
        <ImportIcon className="mr-2 h-4 w-4" />
        Importer
      </Button>

      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Ajouter un Suivi
      </Button>

      {/* Create Dialog */}
      {isCreateDialogOpen && (
        <ProgressReportDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          grades={grades}
          subjects={subjects}
          schoolYearId={schoolYearId}
          refresh={refresh}
        />
      )}

      {/* Import Dialog */}
      {isImportDialogOpen && (
        <ImportProgressReportsDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          grades={grades}
          subjects={subjects}
          schoolYearId={schoolYearId}
        />
      )}
    </div>
  )
}
