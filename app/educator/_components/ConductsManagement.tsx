// app/educator/_components/ConductsManagement.tsx

'use client'

import type { IConductQueryParams, IConductStudent } from '../types'
import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { DownloadCloudIcon, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  EducatorConductFilters,
  EducatorConductFilterSection,
  EducatorConductStatsCards,
  EducatorConductStudentsTable,
  EducatorIncidentModal,
} from '.'
import { useEducatorConduct } from '../hooks'
import { getConductGradeLabel } from '../types'

const ITEMS_PER_PAGE = 12

const defaultQueryParams: IConductQueryParams = {
  page: 1,
  limit: ITEMS_PER_PAGE,
  sort: { column: 'lastName', direction: 'asc' },
}

export function ConductsManagement() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const {
    classes,
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
    fetchClassesForFilter,
  } = useEducatorConduct()

  // Initialize data on component mount
  async function initializeData() {
    try {
      await Promise.all([
        fetchStudents(defaultQueryParams),
        fetchStats(),
        fetchClassesForFilter(),
      ])
    }
    catch (error) {
      console.error('Error initializing data:', error)
      toast.error('Une erreur est survenue lors de la récupération des données.')
    }
  }

  React.useEffect(() => {
    initializeData()
  }, [fetchStudents, fetchStats, fetchClassesForFilter])

  // Filter handlers
  const handleSearchTermChange = useDebouncedCallback((searchTerm: string) => {
    setFilters({ searchTerm: searchTerm || undefined, page: 1 })
    fetchStudents({ ...filters, searchTerm: searchTerm || undefined, page: 1 })
  }, 500, { maxWait: 1200 })

  const handleClassChange = (classId: string) => {
    setFilters({ classId: classId || undefined, page: 1 })
    fetchStudents({ ...filters, classId: classId || undefined, page: 1 })
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

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true)

      // Build query parameters for the PDF generation
      const queryParams = new URLSearchParams()

      if (filters.classId) {
        queryParams.set('classId', filters.classId)
      }
      if (filters.gradeFilter) {
        queryParams.set('gradeFilter', filters.gradeFilter)
      }
      if (filters.scoreRange) {
        queryParams.set('minScore', filters.scoreRange.min.toString())
        queryParams.set('maxScore', filters.scoreRange.max.toString())
      }

      // Generate the PDF report
      const reportUrl = `/api/generate-conduct-report-pdf?${queryParams.toString()}`
      const response = await fetch(reportUrl)

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate filename based on current filters
      const getFileName = () => {
        const date = new Date().toISOString().split('T')[0]
        let filename = `rapport_conduite_${date}`

        if (filters.classId) {
          filename += `_classe_${filters.classId}`
        }
        if (filters.gradeFilter) {
          filename += `_${filters.gradeFilter.toLowerCase()}`
        }

        return `${filename}.pdf`
      }

      link.download = getFileName()
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Rapport PDF généré avec succès')
    }
    catch (error) {
      console.error('Report generation error:', error)
      toast.error('Échec de la génération du rapport PDF')
    }
    finally {
      setIsGeneratingReport(false)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Gestion de la Conduite
              </h1>
              <p className="text-slate-600 mt-1">
                Suivi et évaluation du comportement des élèves
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleGenerateReport}
                className="hidden sm:flex bg-secondary/80 backdrop-blur-sm hover:bg-secondary hover:shadow-md transition-all duration-200 border-secondary/20"
                disabled={isLoading || isGeneratingReport}
              >
                {isGeneratingReport
                  ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    )
                  : (
                      'Générer Rapport'
                    )}
              </Button>

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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-label="Filter"
                    className="hidden sm:flex bg-secondary/80 backdrop-blur-sm hover:bg-secondary hover:shadow-md transition-all duration-200 border-secondary/20"
                  >
                    <MixerVerticalIcon className="mr-2 h-4 w-4" />
                    Filtrer
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm border-secondary/20">
                  <EducatorConductFilterSection
                    classes={classes}
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
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && <EducatorConductStatsCards stats={stats} />}

        {/* Main Content Section */}
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm">
            <CardContent className="p-6">
              <EducatorConductFilters
                searchTerm={searchTerm}
                onSearchTermChange={(val) => {
                  setSearchTerm(val)
                  handleSearchTermChange(val)
                }}
                totalCount={totalCount}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Students Table/Cards */}
          <EducatorConductStudentsTable
            students={students}
            isLoading={isLoading}
            onSort={handleSort}
            onAddIncident={handleAddIncident}
            sortColumn={filters.sort?.column}
            sortDirection={filters.sort?.direction}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
                <CardContent className="px-6 py-4">
                  <div className="flex items-center justify-center gap-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="bg-white/80 hover:bg-white transition-colors"
                    >
                      Précédent
                    </Button>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        Page
                        {' '}
                        {currentPage}
                      </span>
                      <span className="text-sm text-slate-500">
                        sur
                        {' '}
                        {totalPages}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="bg-white/80 hover:bg-white transition-colors"
                    >
                      Suivant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Incident Modal */}
      {showIncidentModal && selectedStudentId && (
        <Dialog open={showIncidentModal} onOpenChange={handleIncidentModalClose}>
          <EducatorIncidentModal
            studentId={selectedStudentId}
            onClose={handleIncidentModalClose}
            onIncidentCreated={handleIncidentCreated}
          />
        </Dialog>
      )}
    </div>
  )
}
