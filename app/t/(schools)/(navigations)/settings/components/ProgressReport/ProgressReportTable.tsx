import type { IGrade, ILessonProgressReportConfig, ISubject } from '@/types'
import { useEffect, useState } from 'react'
import { Pagination } from '@/components/Pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getLessonsProgressReportsConfig } from '@/services/progressReportService'
import { ProgressReportTableActions } from './ProgressReportTableActions'

interface ProgressReportTableProps {
  schoolId: string
  filters: {
    gradeId?: number
    schoolYearId: number
    subjectId?: string
    series?: string
    isCompleted?: boolean
  }
  page: number
  limit: number
  refresh: () => Promise<void>
  grades?: IGrade[]
  subjects?: ISubject[]
}

const DEFAULT_GRADES: IGrade[] = []
const DEFAULT_SUBJECTS: ISubject[] = []

export function ProgressReportTable({
  schoolId,
  filters,
  page,
  limit,
  refresh,
  grades = DEFAULT_GRADES,
  subjects = DEFAULT_SUBJECTS,
}: ProgressReportTableProps) {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<ILessonProgressReportConfig[]>([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const result = await getLessonsProgressReportsConfig({
          schoolId,
          filters,
          page,
          limit,
        })
        setReports(result.data)
        setCount(result.count || 0)
      }
      catch (error) {
        console.error('Error fetching progress reports:', error)
      }
      finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [schoolId, filters, page, limit])

  const totalPages = Math.ceil(count / limit)

  if (loading) {
    return <div className="flex justify-center p-4">Chargement en cours...</div>
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
              {/* <TableHead>Progression</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Aucun rapport de progression trouvé.
                    </TableCell>
                  </TableRow>
                )
              : (
                  reports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>{report.level}</TableCell>
                      <TableCell>{report.subjectName}</TableCell>
                      <TableCell>{report.lessonOrder}</TableCell>
                      <TableCell className="font-medium">{report.lesson}</TableCell>
                      {/* <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(report.sessionsCompleted / report.sessionsCount) * 100}
                            className="w-20 h-2"
                            aria-label={`Progression ${report.lesson}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {report.sessionsCompleted}
                            /
                            {report.sessionsCount}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.isCompleted ? 'success' : 'secondary'}>
                          {report.isCompleted ? 'Terminé' : 'En cours'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(report.startedAt)}</TableCell>
                      <TableCell>{report.completedAt ? formatDate(report.completedAt) : '-'}</TableCell> */}
                      <TableCell className="text-right">
                        <ProgressReportTableActions
                          schoolYearId={filters.schoolYearId}
                          report={report}
                          refresh={refresh}
                          grades={grades}
                          subjects={subjects}
                        />
                      </TableCell>
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
