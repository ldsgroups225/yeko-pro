'use client'

import type { IStudentDTO, IStudentsQueryParams } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useSearchStudentParamsState, useStudentClassSelection, useStudentsData } from '@/hooks'
import { MixerVerticalIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDebouncedCallback } from 'use-debounce'
import { StudentFilterSection, StudentsFilters, StudentsTable } from './_components'

const ITEMS_PER_PAGE = 12

const defaultQueryParams: IStudentsQueryParams = {
  searchTerm: undefined,
  selectedClasses: undefined,
  schoolId: undefined,
  hasNotParentFilter: undefined,
  hasNotClassFilter: undefined,
  page: 1,
  isStudent: true,
  sort: undefined,
}

export default function StudentsPage() {
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [_showStudentModal, setShowStudentModal] = useState(false)
  const [_studentToEdit, setStudentToEdit] = useState<IStudentDTO | null>(null)

  const { state, updateState } = useSearchStudentParamsState(defaultQueryParams)
  const [searchTerm, setSearchTerm] = useState<string>(state.searchTerm || '')

  const {
    error,
    status,
    loadMore,
    students,
    pagination,
    currentPage,
    setCurrentPage,
    groupedClasses,
  } = useStudentsData({
    initialItemsPerPage: ITEMS_PER_PAGE,
    filters: state,
  })

  const classSelection = useStudentClassSelection(state.selectedClasses, (selectedClasses) => {
    updateState({ selectedClasses })
  })

  // Filter handlers
  const handleSearchTermChange = useDebouncedCallback((searchTerm: string) => {
    updateState({ searchTerm: searchTerm || undefined })
  }, 500, { maxWait: 1200 })

  const handleClassChange = (classId: string, checked: boolean) => {
    classSelection.handleClassChange(classId, checked)
  }

  const handleHasNotParentFilterChange = (hasNotParentFilter: boolean) => {
    updateState({ hasNotParentFilter })
  }

  const handleHasNotClassFilterChange = (hasNotClassFilter: boolean) => {
    updateState({ hasNotClassFilter })
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > currentPage) {
      loadMore()
    }
    setCurrentPage(newPage)
    // TODO: updateState({ page: newPage })
  }

  // Student management handlers
  const handleStudentEdit = (studentData: IStudentDTO) => {
    setStudentToEdit(studentData)
    setShowStudentModal(true)
  }

  // const handleStudentModalClose = () => {
  //   setShowStudentModal(false)
  //   setStudentToEdit(null)
  // }

  const handleSort = (field: string) => {
    updateState({
      sort: {
        column: field,
        direction: state.sort?.direction === 'asc' ? 'desc' : 'asc',
      },
    })
  }

  // Action handlers
  const handleExport = () => {
    toast.info('Export functionality to be implemented')
  }

  const handleImport = () => {
    toast.info('Import functionality to be implemented')
  }

  const handleArchive = () => {
    toast.info('Archive functionality to be implemented')
  }

  // Sync filters with useStudents
  // useEffect(() => {
  //   setFilters({
  //     searchTerm: state.searchTerm,
  //     selectedClasses: state.selectedClasses,
  //     hasNotParentFilter: state.hasNotParentFilter,
  //     hasNotClassFilter: state.hasNotClassFilter,
  //   })
  // }, [state, setFilters])

  if (status === 'error') {
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

          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" aria-label="Filter">
                  <MixerVerticalIcon className="mr-2 h-4 w-4" />
                  Filtrer
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto">
                <StudentFilterSection
                  groupedClasses={groupedClasses}
                  selectedClasses={state.selectedClasses}
                  hasNotParentFilter={state.hasNotParentFilter}
                  hasNotClassFilter={state.hasNotClassFilter}
                  onClassChange={handleClassChange}
                  onHasNotParentFilterChange={handleHasNotParentFilterChange}
                  onHasNotClassFilterChange={handleHasNotClassFilterChange}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-3">
          <StudentsFilters
            searchTerm={searchTerm}
            onSearchTermChange={(val) => {
              setSearchTerm(val)
              handleSearchTermChange(val)
            }}
            onImportClick={handleImport}
            onExportClick={handleExport}
            onArchiveClick={handleArchive}
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
          />

          {isTableViewMode
            ? (
                <StudentsTable
                  students={students}
                  isLoading={status === 'idle' || status === 'loading'}
                  onStudentEdit={handleStudentEdit}
                  onSort={handleSort}
                />
              )
            : (
                <pre className="mt-4 bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(students, null, 2)}
                </pre>
              )}

          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* {showStudentModal && studentToEdit && (
        <StudentCreationOrUpdateDialog
          student={studentToEdit}
          open={showStudentModal}
          onClose={handleStudentModalClose}
        />
      )} */}
    </div>
  )
}
