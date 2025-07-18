'use client'

import type { ILessonProgressReportConfig } from '@/types'
import { Edit, Loader2, MoreHorizontal, Trash } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteLessonProgressReportConfig } from '@/services/progressReportService'
import { ProgressReportDialog } from './ProgressReportDialog'

interface ProgressReportTableActionsProps {
  schoolYearId: number
  report: ILessonProgressReportConfig
  refresh: () => Promise<void>
}

export function ProgressReportTableActions({ schoolYearId, report, refresh }: ProgressReportTableActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, startDeleteTransition] = useTransition()

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        await deleteLessonProgressReportConfig(report.id)
        toast.success('Configuration de progression de cours supprimé.')
        // Revalidation handled by server action
      }
      catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression.')
      }
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={handleToggleComplete} disabled={isUpdatingStatus}>
            {isUpdatingStatus ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : report.is_completed ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
            {report.is_completed ? 'Marquer comme En cours' : 'Marquer comme Terminé'}
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive" disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      {isEditOpen && (
        <ProgressReportDialog
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          report={report}
          schoolYearId={schoolYearId}
          refresh={refresh}
        />
      )}
    </>
  )
}
