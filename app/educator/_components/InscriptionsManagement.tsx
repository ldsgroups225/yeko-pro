'use client'

import type { IInscriptionQueryParams, IStudentSearchResult } from '../types/inscription'
import {
  DownloadCloudIcon,
  Loader2,
  SlidersHorizontal,
  UserPlus,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  EducatorInscriptionFilters,
  EducatorInscriptionFilterSection,
  EducatorInscriptionStatsCards,
  EducatorInscriptionTable,
  EducatorNewInscriptionModal,
  EducatorStudentSearchModal,
} from '.'
import { updateInscriptionStatus } from '../actions/inscriptionService'
import { useEducatorInscriptions } from '../hooks/useEducatorInscriptions'
import { useUserStore } from '../stores'
import { getEnrollmentStatusLabel } from '../types/inscription'

interface InscriptionsManagementProps {
  // Remove the old props as we'll fetch data dynamically
}

const ITEMS_PER_PAGE = 12

const defaultQueryParams: IInscriptionQueryParams = {
  page: 1,
  limit: ITEMS_PER_PAGE,
  sort: { column: 'created_at', direction: 'desc' },
}

export function InscriptionsManagement(_props: InscriptionsManagementProps) {
  const { user } = useUserStore()
  const schoolId = user?.school.id

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showNewInscriptionModal, setShowNewInscriptionModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<IStudentSearchResult | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const {
    inscriptions,
    stats,
    grades,
    classes,
    isLoading,
    error,
    totalCount,
    currentPage,
    totalPages,
    filters,
    fetchInscriptions,
    fetchStats,
    fetchGrades,
    fetchClasses,
    setFilters,
    setCurrentPage,
    refreshData,
  } = useEducatorInscriptions()

  // Initialize data on component mount
  async function initializeData() {
    try {
      await Promise.all([
        fetchInscriptions(defaultQueryParams),
        fetchStats(),
        fetchGrades(),
        fetchClasses(),
      ])
    }
    catch {
      // console.error('Error initializing data:', error)
      toast.error('Une erreur est survenue lors de la récupération des données.')
    }
  }

  useEffect(() => {
    initializeData()
  }, [])

  // Filter handlers
  const handleSearchTermChange = useDebouncedCallback((searchTerm: string) => {
    setFilters({ searchTerm: searchTerm || undefined, page: 1 })
    fetchInscriptions({ ...filters, searchTerm: searchTerm || undefined, page: 1 })
  }, 500, { maxWait: 1200 })

  const handleGradeChange = (gradeId: string) => {
    const grade = gradeId === 'all' ? undefined : Number.parseInt(gradeId)
    setFilters({ gradeId: grade, page: 1 })
    fetchInscriptions({ ...filters, gradeId: grade, page: 1 })
  }

  const handleClassChange = (classId: string) => {
    setFilters({ classId: classId || undefined, page: 1 })
    fetchInscriptions({ ...filters, classId: classId || undefined, page: 1 })
  }

  const handleEnrollmentStatusChange = (status: string) => {
    const enrollmentStatus = status === 'all' ? undefined : status
    setFilters({ enrollmentStatus, page: 1 })
    fetchInscriptions({ ...filters, enrollmentStatus, page: 1 })
  }

  const handleGovernmentAffectedChange = (value: boolean | undefined) => {
    setFilters({ isGovernmentAffected: value, page: 1 })
    fetchInscriptions({ ...filters, isGovernmentAffected: value, page: 1 })
  }

  const handleOrphanChange = (value: boolean | undefined) => {
    setFilters({ isOrphan: value, page: 1 })
    fetchInscriptions({ ...filters, isOrphan: value, page: 1 })
  }

  const handleSort = (field: string) => {
    const newSort = {
      column: field,
      direction: filters.sort?.direction === 'asc' ? 'desc' : 'asc',
    } as const
    setFilters({ sort: newSort })
    fetchInscriptions({ ...filters, sort: newSort })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchInscriptions({ ...filters, page })
  }

  // Action handlers
  const handleStatusChange = async (inscriptionId: string, status: string) => {
    try {
      await updateInscriptionStatus(inscriptionId, status)
      toast.success(`Statut mis à jour: ${getEnrollmentStatusLabel(status)}`)
      // Refresh the current data
      await refreshData()
    }
    catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erreur lors de la mise à jour du statut')
    }
  }

  // Handle opening the search modal first
  const handleNewInscription = () => {
    setShowSearchModal(true)
  }

  // Handle when student is found in search
  const handleStudentFound = (student: IStudentSearchResult) => {
    setSelectedStudent(student)
    setShowSearchModal(false)
    setShowNewInscriptionModal(true)
  }

  // Handle creating new student (when not found in search)
  const handleCreateNewStudent = () => {
    setSelectedStudent(null)
    setShowSearchModal(false)
    setShowNewInscriptionModal(true)
  }

  // Handle closing modals
  const handleCloseModals = () => {
    setShowSearchModal(false)
    setShowNewInscriptionModal(false)
    setSelectedStudent(null)
  }

  // Handle successful inscription creation
  const handleInscriptionCreated = () => {
    refreshData()
    handleCloseModals()
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Check if we have inscriptions data, if not, fetch it
      let inscriptionsData = inscriptions

      // If we have filtered/paginated data, we might want complete data for export
      if (filters.searchTerm || filters.gradeId || filters.classId || totalCount > inscriptions.length) {
        // For now, we'll export current data
        // In a real implementation, you might fetch all matching records
        inscriptionsData = inscriptions
      }

      if (inscriptionsData.length === 0) {
        toast.warning('Aucune donnée à exporter')
        return
      }

      // Transform data for Excel with proper French column headers
      const excelData = inscriptionsData.map(inscription => ({
        'Élève': `${inscription.studentFirstName} ${inscription.studentLastName}`.trim(),
        'Matricule': inscription.studentIdNumber,
        'Parent/Tuteur': `${inscription.parentFirstName} ${inscription.parentLastName}`.trim(),
        'Téléphone Parent': inscription.parentPhone || '',
        'Niveau': inscription.gradeName,
        'Classe': inscription.className || 'Non assigné',
        'Statut': getEnrollmentStatusLabel(inscription.enrollmentStatus),
        'Aide Gouvernementale': inscription.isGovernmentAffected ? 'Oui' : 'Non',
        'Élève Orphelin': inscription.isOrphan ? 'Oui' : 'Non',
        'Abonnement Cantine': inscription.isSubscribedToCanteen ? 'Oui' : 'Non',
        'Abonnement Transport': inscription.isSubscribedToTransportation ? 'Oui' : 'Non',
        'Date d\'inscription': new Date(inscription.createdAt).toLocaleDateString('fr-FR'),
      }))

      // Create Excel file
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths for better readability
      const colWidths = [
        { wch: 25 }, // Élève
        { wch: 15 }, // Matricule
        { wch: 25 }, // Parent/Tuteur
        { wch: 15 }, // Téléphone Parent
        { wch: 12 }, // Niveau
        { wch: 15 }, // Classe
        { wch: 12 }, // Statut
        { wch: 18 }, // Aide Gouvernementale
        { wch: 15 }, // Élève Orphelin
        { wch: 18 }, // Abonnement Cantine
        { wch: 18 }, // Abonnement Transport
        { wch: 15 }, // Date d'inscription
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscriptions')

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `inscriptions_${currentDate}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast.success('Export des inscriptions réussi')
    }
    catch (error) {
      console.error('Export error:', error)
      toast.error('Échec de l\'export des inscriptions')
    }
    finally {
      setIsExporting(false)
    }
  }

  if (error) {
    return (
      <div className="space-y-2 px-6 py-2">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">
              Erreur lors du chargement des données d'inscription:
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
              <h1 className="text-3xl font-bold tracking-tight">
                Gestion des Inscriptions
              </h1>
              <p className="text-muted-foreground mt-1">
                Suivi et traitement des demandes d'inscription
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
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
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filtrer
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm border-secondary/20">
                  <EducatorInscriptionFilterSection
                    grades={grades}
                    classes={classes}
                    onGradeChange={handleGradeChange}
                    onClassChange={handleClassChange}
                    onEnrollmentStatusChange={handleEnrollmentStatusChange}
                    onGovernmentAffectedChange={handleGovernmentAffectedChange}
                    onOrphanChange={handleOrphanChange}
                    selectedGrade={filters.gradeId?.toString() || 'all'}
                    selectedClass={filters.classId || 'all'}
                    selectedEnrollmentStatus={filters.enrollmentStatus || 'all'}
                    isGovernmentAffected={filters.isGovernmentAffected}
                    isOrphan={filters.isOrphan}
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleNewInscription}
                className="bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Nouvelle Inscription
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && <EducatorInscriptionStatsCards stats={stats} />}

        {/* Main Content Section */}
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm">
            <CardContent className="p-6">
              <EducatorInscriptionFilters
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

          {/* Inscriptions Table/Cards */}
          <EducatorInscriptionTable
            inscriptions={inscriptions}
            isLoading={isLoading}
            onSort={handleSort}
            onStatusChange={handleStatusChange}
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
                      <span className="text-sm text-muted-foreground">
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

      {/* Student Search Modal */}
      {showSearchModal && (
        <Dialog
          open={showSearchModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowSearchModal(false)
            }
          }}
        >
          <EducatorStudentSearchModal
            onClose={() => setShowSearchModal(false)}
            onStudentFound={handleStudentFound}
            onCreateNew={handleCreateNewStudent}
          />
        </Dialog>
      )}

      {/* New Inscription Modal */}
      {showNewInscriptionModal && (
        <Dialog
          open={showNewInscriptionModal}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseModals()
            }
          }}
        >
          <EducatorNewInscriptionModal
            schoolId={schoolId!}
            grades={grades}
            classes={classes}
            onClose={handleCloseModals}
            onInscriptionCreated={handleInscriptionCreated}
            prefilledStudent={selectedStudent}
          />
        </Dialog>
      )}
    </div>
  )
}
