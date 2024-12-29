'use client'

import type { IStudentDTO, IStudentsQueryParams } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStudents } from '@/hooks'
import { PlusIcon } from '@radix-ui/react-icons'
import consola from 'consola'
import { useState } from 'react'
import {
//   // ImportStudentsDialog,
//   // StudentCreationOrUpdateDialog,
//   StudentsFilters,
//   // StudentsGrid,
  StudentsTable,
} from './_components'

export default function StudentsPage() {
  const [isTableViewMode, _setIsTableViewMode] = useState(true)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showImportModal, _setShowImportModal] = useState(false)
  const [studentToEdit, setStudentToEdit] = useState<IStudentDTO | null>(null)

  // const { state, updateState } = useSearchStudentParamsState(defaultQueryParams)

  const {
    // classes,
    // grades,
    students,
    // loadMore,
    currentPage,
    pagination,
    // setCurrentPage,
    isLoading,
    error,
  } = useStudents()

  // const handleSearchTermChange = (searchTerm: string) =>
  //   updateState({ searchTerm: searchTerm || undefined })

  // const handleClassChange = (selectedClassesId?: string[]) =>
  //   updateState({ selectedClassesId })

  // const handleHasNotParentFilterChange = (hasNotParentFilter: boolean) =>
  //   updateState({ hasNotParentFilter })

  // const handleHasNotClassFilterChange = (hasNotClassFilter: boolean) =>
  //   updateState({ hasNotClassFilter })

  // const handleSort = (column: string, direction: 'asc' | 'desc') =>
  //   updateState({ sort: { column, direction } })

  const handleStudentEdit = (studentData: string) => {
    const parsedStudent = JSON.parse(studentData)
    setStudentToEdit(parsedStudent)
    setShowStudentModal(true)
  }

  const handlePageChange = (newPage: number) => {
    consola.log('handlePageChange', newPage)
    // if (newPage > currentPage) {
    //   loadMore()
    // }
    // setCurrentPage(newPage)
    // updateState({ page: newPage })
  }

  // const handleExport = () => {
  //   // Implement export functionality
  // }

  // const handleArchive = () => {
  //   // Implement archive functionality
  // }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="p-6">
            <p className="text-destructive">
              Error loading students:
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
          {/* <StudentsFilters
            classes={classes ?? []}
            // TODO: grades={grades ?? []} === USE IT INSTEAD SELECTED_CLASSES_ID
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
            onImportClick={() => setShowImportModal(true)}
            onExportClick={handleExport}
            onArchiveClick={handleArchive}
            // TODO: onSort={handleSort} === USE IT IN STUDENTS TABLE
            // currentSort={state.sort}
          /> */}
          {isTableViewMode
            ? (
                <StudentsTable
                  students={students}
                  isLoading={isLoading}
                  onStudentEdit={handleStudentEdit}
                  // sort={state.sort}
                  // onSort={handleSort}
                />
              )
            : (
                <pre>
                  {JSON.stringify(students, null, 2)}
                </pre>
                // <StudentsGrid
                //   students={results}
                //   isLoading={status === 'idle' || isLoading}
                //   onStudentEdit={handleStudentEdit}
                // />
              )}
          {status !== 'idle' && !isLoading && (
            <Pagination
              currentPage={currentPage}
              totalPages={status === 'success' ? pagination.totalPages : pagination.totalPages + 1}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {showStudentModal && (
        <p>TODO: StudentCreationOrUpdateDialog</p>
        // <StudentCreationOrUpdateDialog
        //   open={showStudentModal}
        //   oldStudent={studentToEdit}
        //   onOpenChange={setShowStudentModal}
        //   classOptions={classes ?? []}
        //   gradeOptions={grades ?? []}
        // />
      )}

      {showImportModal && (
        <p>TODO: ImportStudentsDialog</p>
        // <ImportStudentsDialog
        //   open={showImportModal}
        //   onOpenChange={setShowImportModal}
        // />
      )}
    </div>
  )
}
