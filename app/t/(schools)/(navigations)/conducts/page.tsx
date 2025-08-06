'use client'

import type { IConductQueryParams } from '@/types'
import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { DownloadCloudIcon, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useConduct } from '@/hooks'
import { fetchConductStudents } from '@/services'
import { getConductGradeLabel } from '@/types/conduct'
import {
  ConductFilters,
  ConductFilterSection,
  ConductStatsCards,
  ConductStudentsTable,
  IncidentModal,
} from './_components'

const ITEMS_PER_PAGE = 12

const defaultQueryParams: IConductQueryParams = {
  page: 1,
  limit: ITEMS_PER_PAGE,
  sort: { column: 'lastName', direction: 'asc' },
}

export default function ConductsPage() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const {
    students,
    stats,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    filters,
    fetchStudents,
    fetchStats,
    setFilters,
    setCurrentPage,
  } = useConduct()

  // Initialize data on component mount
  React.useEffect(() => {
    fetchStudents(defaultQueryParams)
    fetchStats()
  }, [fetchStudents, fetchStats])

  // Filter handlers
  const handleSearchTermChange = useDebouncedCallback((searchTerm: string) => {
    setFilters({ searchTerm: searchTerm || undefined, page: 1 })
    fetchStudents({ ...filters, searchTerm: searchTerm || undefined, page: 1 })
  }, 500, { maxWait: 1200 })

  const handleClassChange = (classId: string) => {
    const filteredClassId = classId === 'all' || !classId ? undefined : classId
    setFilters({ classId: filteredClassId, page: 1 })
    fetchStudents({ ...filters, classId: filteredClassId, page: 1 })
  }

  const handleGradeFilterChange = (gradeFilter: string) => {
    const grade = gradeFilter === 'all' ? undefined : gradeFilter as any
    setFilters({ gradeFilter: grade, page: 1 })
    fetchStudents({ ...filters, gradeFilter: grade, page: 1 })
  }

  const handleScoreRangeChange = (min: number, max: number) => {
    const scoreRange = min === 0 && max === 20 ? undefined : { min, max }
    setFilters({ scoreRange, page: 1 })
    fetchStudents({ ...filters, scoreRange, page: 1 })
  }

  const handleSort = (field: string) => {
    const newSort = {
      column: field,
      direction: filters.sort?.direction === 'asc' ? 'desc' : 'asc',
    } as const
    setFilters({ sort: newSort })
    fetchStudents({ ...filters, sort: newSort })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchStudents({ ...filters, page })
  }

  // Action handlers
  const handleAddIncident = (studentId: string) => {
    setSelectedStudentId(studentId)
    setShowIncidentModal(true)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      // Check if we have students data, if not, fetch it
      let studentsData = students
      
      // If we have filtered/paginated data, fetch complete data for export
      if (filters.searchTerm || filters.classId || filters.gradeFilter || filters.scoreRange || totalCount > students.length) {
        const completeData = await fetchConductStudents({
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
      const excelData = studentsData.map(student => ({
        'Élève': `${student.firstName} ${student.lastName}`.trim(),
        'Matricule': student.idNumber,
        'Classe': student.className || 'Non assigné',
        'Note de conduite': student.currentScore.totalScore.toFixed(2),
        'Appréciation': getConductGradeLabel(student.currentScore.grade),
        'Assiduité': student.currentScore.attendanceScore.toFixed(1) + '/6',
        'Tenue': student.currentScore.dresscodeScore.toFixed(1) + '/3',
        'Moralité': student.currentScore.moralityScore.toFixed(1) + '/4',
        'Discipline': student.currentScore.disciplineScore.toFixed(1) + '/7',
        'Absences': student.attendanceStats.absences,
        'Retards': student.attendanceStats.lates,
        'Taux de présence': student.attendanceStats.attendanceRate.toFixed(1) + '%'
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
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Échec de l\'export des notes de conduite')
    } finally {
      setIsExporting(false)
    }
  }

  const handleGenerateReport = () => {
    toast.info('Report generation functionality to be implemented')
  }

  const handleIncidentModalClose = () => {
    setShowIncidentModal(false)
    setSelectedStudentId(null)
  }

  const handleIncidentCreated = () => {
    // Refresh data after incident creation
    fetchStudents(filters)
    fetchStats()
    toast.success('Incident enregistré avec succès')
  }

  if (error) {
    return (
      <div className="space-y-2 px-6 py-2">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">
              Erreur lors du chargement des données de conduite:
              {' '}
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-6 py-2">
      {/* Statistics Cards */}
      {stats && <ConductStatsCards stats={stats} />}

      {/* Main Content Card */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">Gestion de la Conduite</CardTitle>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleGenerateReport}
              className="hidden sm:flex"
            >
              Générer Rapport
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              className="hidden sm:flex"
              disabled={isLoading || isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportation...
                </>
              ) : (
                <>
                  <DownloadCloudIcon className="mr-2 h-4 w-4" />
                  Exporter
                </>
              )}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" aria-label="Filter">
                  <MixerVerticalIcon className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <ConductFilterSection
                  onClassChange={handleClassChange}
                  onGradeFilterChange={handleGradeFilterChange}
                  onScoreRangeChange={handleScoreRangeChange}
                  selectedClass={filters.classId || 'all'}
                  selectedGrade={filters.gradeFilter}
                  scoreRange={filters.scoreRange}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <ConductFilters
            searchTerm={searchTerm}
            onSearchTermChange={(val) => {
              setSearchTerm(val)
              handleSearchTermChange(val)
            }}
            totalCount={totalCount}
            isLoading={isLoading}
          />

          <ConductStudentsTable
            students={students}
            isLoading={isLoading}
            onSort={handleSort}
            onAddIncident={handleAddIncident}
            sortColumn={filters.sort?.column}
            sortDirection={filters.sort?.direction}
          />

          {totalPages > 1 && (
            <div className="mt-6">
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident Modal */}
      {showIncidentModal && selectedStudentId && (
        <Dialog open={showIncidentModal} onOpenChange={handleIncidentModalClose}>
          <IncidentModal
            studentId={selectedStudentId}
            onClose={handleIncidentModalClose}
            onIncidentCreated={handleIncidentCreated}
          />
        </Dialog>
      )}
    </div>
  )
}
