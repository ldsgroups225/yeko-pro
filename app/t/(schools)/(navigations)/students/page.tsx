'use client'

import type { IStudentDTO, IStudentsQueryParams } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClasses, useSearchStudentParamsState, useStudents } from '@/hooks'
import { PlusIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { StudentsFilters, StudentsTable } from './_components'

const ITEMS_PER_PAGE = 12

const defaultQueryParams: IStudentsQueryParams = {
  searchTerm: undefined,
  selectedClassesId: undefined,
  schoolId: undefined,
  hasNotParentFilter: undefined,
  hasNotClassFilter: undefined,
  page: 1,
  itemsPerPage: ITEMS_PER_PAGE,
  isStudent: true,
  sort: undefined,
}

export default function StudentsPage() {
  const { classes } = useClasses()

  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [_studentToEdit, setStudentToEdit] = useState<IStudentDTO | null>(null)

  const { state, updateState } = useSearchStudentParamsState(defaultQueryParams)

  const {
    students,
    currentPage,
    pagination,
    setPage,
    isLoading,
    error,
    setFilters,
  } = useStudents()

  // Handlers for filter changes
  const handleSearchTermChange = (searchTerm: string) => {
    updateState({ searchTerm: searchTerm || undefined })
  }

  const handleClassChange = (selectedClassesId?: string[]) => {
    updateState({ selectedClassesId })
  }

  const handleHasNotParentFilterChange = (hasNotParentFilter: boolean) => {
    updateState({ hasNotParentFilter })
  }

  const handleHasNotClassFilterChange = (hasNotClassFilter: boolean) => {
    updateState({ hasNotClassFilter })
  }

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    updateState({ page: newPage })
  }

  // Handler for student edit
  const handleStudentEdit = (studentData: IStudentDTO) => {
    setStudentToEdit(studentData)
    setShowStudentModal(true)
  }

  // Handler for student sort
  const handleSort = (_field: string) => {
    // Implement sort functionality
  }

  // Export, Archive, and Import handlers (placeholders)
  const handleExport = () => {
    // Implement export functionality
  }

  const handleImport = () => {
    // Implement import functionality
  }

  const handleArchive = () => {
    // Implement archive functionality
  }

  // Effect to sync filters with useStudents
  useEffect(() => {
    setFilters({
      searchTerm: state.searchTerm,
      selectedClassesId: state.selectedClassesId,
      hasNotParentFilter: state.hasNotParentFilter,
      hasNotClassFilter: state.hasNotClassFilter,
    })
  }, [state, setFilters])

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">
              Error loading students:
              {' '}
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-6 py-2">
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Liste des étudiants</CardTitle>
          <Button
            variant="outline"
            aria-label="New Student"
            onClick={() => setShowStudentModal(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouvel étudiant
          </Button>
        </CardHeader>
        <CardContent className="px-6 py-3">
          <StudentsFilters
            classes={classes}
            searchTerm={state.searchTerm || ''}
            onSearchTermChange={handleSearchTermChange}
            selectedClassesId={state.selectedClassesId}
            onClassChange={handleClassChange}
            hasNotParentFilter={!!state.hasNotParentFilter}
            onHasNotParentFilterChange={handleHasNotParentFilterChange}
            hasNotClassFilter={!!state.hasNotClassFilter}
            onHasNotClassFilterChange={handleHasNotClassFilterChange}
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
            onImportClick={handleImport}
            onExportClick={handleExport}
            onArchiveClick={handleArchive}
          />
          {isTableViewMode
            ? (
                <StudentsTable
                  students={students}
                  isLoading={isLoading}
                  onStudentEdit={handleStudentEdit}
                  onSort={handleSort}
                />
              )
            : (
                <pre>{JSON.stringify(students, null, 2)}</pre>
              )}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {showStudentModal && (
        <p>TODO: StudentCreationOrUpdateDialog</p>
      )}
    </div>
  )
}
