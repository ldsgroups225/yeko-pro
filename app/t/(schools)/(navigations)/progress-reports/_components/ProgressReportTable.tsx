import type { JSX } from 'react'
import type { LessonProgressReportSortKeys } from '@/services/progressReportService'
import type { ILessonProgressReport } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { getLessonsProgressReports } from '@/services/progressReportService'

interface ProgressReportTableProps {
  filters: {
    gradeId?: number
    subjectId?: string
    schoolYearId?: number
    series?: string
    classId?: string
    isCompleted?: boolean
  }
  page: number
  limit: number
  sortBy?: LessonProgressReportSortKeys
  ascending?: boolean
}

export async function ProgressReportTable({
  filters,
  page,
  limit,
  sortBy,
  ascending,
}: ProgressReportTableProps): Promise<JSX.Element> {
  const { data: reports, count } = await getLessonsProgressReports({
    filters,
    page,
    limit,
    sortBy,
    ascending,
  })

  // Calculate total pages for pagination
  const totalPages = Math.ceil((count ?? 0) / limit)

  // Helper function to safely calculate progress percentage
  const calculateProgress = (completed: number, total: number): number => {
    // Ensure total is positive before calculating
    if (total <= 0) {
      return 0
    }
    // Calculate percentage and round to nearest integer
    return Math.round((completed / total) * 100)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Niveau</TableHead>
              <TableHead>Matière</TableHead>
              <TableHead>Ordre</TableHead>
              <TableHead>Leçon</TableHead>
              <TableHead>Progression</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
            </TableRow>
          </TableHeader>
          {/* Table Body */}
          <TableBody>
            {/* Handle empty state */}
            {reports.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {' '}
                      {/* Adjusted colSpan */}
                      Aucun rapport de progression trouvé pour les filtres sélectionnés.
                    </TableCell>
                  </TableRow>
                )
              : (
                  reports.map((report: ILessonProgressReport) => (
                    <TableRow key={report.id}>
                      {/* Access nested config data for display */}
                      <TableCell>{report.config.level}</TableCell>
                      <TableCell>{report.config.subjectName}</TableCell>
                      <TableCell>{report.config.lessonOrder}</TableCell>
                      {/* Assuming 'lesson' name is needed and available in config */}
                      <TableCell className="font-medium">{report.config.lesson ?? 'N/A'}</TableCell>
                      {/* Progress bar cell */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={calculateProgress(report.sessionsCompleted, report.config.sessionsCount)}
                            className="h-2 w-20" // Adjusted width
                            aria-label={`Progression ${report.config.lesson ?? 'de la leçon'}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {report.sessionsCompleted}
                            {' '}
                            /
                            {report.config.sessionsCount}
                          </span>
                        </div>
                      </TableCell>
                      {/* Status badge cell */}
                      <TableCell>
                        <Badge variant={report.isCompleted ? 'success' : 'secondary'}>
                          {report.isCompleted ? 'Terminé' : 'En cours'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(report.startedAt)}</TableCell>
                      <TableCell>{report.completedAt ? formatDate(report.completedAt) : '-'}</TableCell>
                    </TableRow>
                  ))
                )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  )
}
