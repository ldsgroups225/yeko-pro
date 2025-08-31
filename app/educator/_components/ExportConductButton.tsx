'use client'

import type { IConductStudent } from '../types'
import { DownloadCloudIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useEducatorConduct } from '../hooks'
import { getConductGradeLabel } from '../types'

interface Props {
  students: IConductStudent[]
}

export function ExportConductButton({ students }: Props) {
  const {
    isLoading,
    totalCount,
    filters,
  } = useEducatorConduct()

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Check if we have students data, if not, fetch it
      let studentsData = students

      // If we have filtered/paginated data, fetch complete data for export
      if (filters.searchTerm || filters.classId || filters.gradeFilter || filters.scoreRange || totalCount > students.length) {
        const { getEducatorConductStudents } = await import('@/app/educator/actions/conductService')
        const completeData = await getEducatorConductStudents({
          ...filters,
          limit: 1000, // Get up to 1000 students for export
          page: 1,
        })
        studentsData = completeData.students
      }

      if (studentsData.length === 0) {
        toast.warning('Aucune donnée à exporter')
        return
      }

      // Transform data for Excel with proper French column headers
      const excelData = studentsData.map((student: IConductStudent) => ({
        'Élève': `${student.firstName} ${student.lastName}`.trim(),
        'Matricule': student.idNumber,
        'Classe': student.className || 'Non assigné',
        'Note de conduite': student.currentScore.totalScore.toFixed(2),
        'Appréciation': getConductGradeLabel(student.currentScore.grade),
        'Assiduité': `${student.currentScore.attendanceScore.toFixed(1)}/6`,
        'Tenue': `${student.currentScore.dresscodeScore.toFixed(1)}/3`,
        'Moralité': `${student.currentScore.moralityScore.toFixed(1)}/4`,
        'Discipline': `${student.currentScore.disciplineScore.toFixed(1)}/7`,
        'Absences': student.attendanceStats.absences,
        'Retards': student.attendanceStats.lates,
        'Taux de présence': `${student.attendanceStats.attendanceRate.toFixed(1)}%`,
      }))

      // Create Excel file
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths for better readability
      const colWidths = [
        { wch: 25 }, // Élève
        { wch: 15 }, // Matricule
        { wch: 15 }, // Classe
        { wch: 15 }, // Note de conduite
        { wch: 20 }, // Appréciation
        { wch: 12 }, // Assiduité
        { wch: 12 }, // Tenue
        { wch: 12 }, // Moralité
        { wch: 12 }, // Discipline
        { wch: 10 }, // Absences
        { wch: 10 }, // Retards
        { wch: 15 }, // Taux de présence
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes de conduite')

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `notes_de_conduite_${currentDate}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast.success('Export des notes de conduite réussi')
    }
    catch (error) {
      console.error('Export error:', error)
      toast.error('Échec de l\'export des notes de conduite')
    }
    finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="hidden sm:flex bg-secondary/80 backdrop-blur-sm hover:bg-secondary hover:shadow-md transition-all duration-200 border-secondary/20"
      disabled={isLoading || isExporting}
    >
      {isExporting
        ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exportation...
            </>
          )
        : (
            <>
              <DownloadCloudIcon className="mr-2 h-4 w-4" />
              Exporter
            </>
          )}
    </Button>
  )
}
