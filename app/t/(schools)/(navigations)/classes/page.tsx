'use client'

import type { IClass } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useClassesData, useSearchParamsState } from '@/hooks'
import { PlusIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import {
  ClassCreationOrUpdateDialog,
  ClassesFilters,
  ClassesGrid,
  ClassesTable,
  ImportClassesDialog,
} from './_components'

const ITEMS_PER_PAGE = 12

export default function ClassesPage() {
  // Component state
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)

  // Search params state
  const { state, updateState } = useSearchParamsState({
    grade: undefined,
    search: undefined,
    active: undefined,
    teacher: undefined,
  })

  // Initialize classes data
  const {
    grades,
    results,
    status,
    pagination,
    currentPage,
  } = useClassesData({
    initialItemsPerPage: ITEMS_PER_PAGE,
    filters: state,
  })

  // Handlers
  const handleGradeChange = (grade?: string) => updateState({ grade })

  const handleSearchChange = (search: string) => updateState({ search })

  const handleActiveChange = (active?: boolean) => updateState({ active })

  const handleTeacherChange = (teacher?: boolean) => updateState({ teacher })

  const handleClassEdit = (classData: string) => {
    const parsedClass = JSON.parse(classData)
    setClassToEdit(parsedClass)
    setShowClassModal(true)
  }

  return (
    <div className="space-y-2 px-6 py-2">
      {/* Main Card */}
      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Liste des classes</CardTitle>
          <Button
            variant="outline"
            aria-label="New Class"
            onClick={() => setShowClassModal(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouvelle classe
          </Button>
        </CardHeader>

        <CardContent className="px-6 py-3">
          {/* Filters */}
          <ClassesFilters
            grades={grades}
            selectedGrade={state.grade}
            onGradeChange={handleGradeChange}
            searchTerm={state.search || ''}
            onSearchTermChange={handleSearchChange}
            classesActiveState={state.active}
            onClassesActiveStateChange={handleActiveChange}
            hasMainTeacher={state.teacher}
            onHasMainTeacherChange={handleTeacherChange}
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
            onImportClick={() => setShowImportModal(true)}
            onExportClick={() => {}}
            onArchiveClick={() => {}}
          />

          {/* Classes List */}
          {isTableViewMode
            ? (
                <ClassesTable
                  classes={results}
                  isLoading={status === 'idle' || status === 'loading'}
                  onClassEdit={handleClassEdit}
                />
              )
            : (
                <ClassesGrid
                  classes={results}
                  isLoading={status === 'idle' || status === 'loading'}
                  onClassEdit={handleClassEdit}
                />
              )}

          {/* Pagination */}
          {status !== 'idle' && status !== 'loading' && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showClassModal && (
        <ClassCreationOrUpdateDialog
          open={showClassModal}
          oldClass={
            classToEdit
              ? {
                  id: classToEdit.id,
                  name: classToEdit.name,
                  gradeId: classToEdit.gradeId,
                  maxStudent: classToEdit.maxStudent,
                }
              : undefined
          }
          onOpenChange={setShowClassModal}
          gradeOptions={grades ?? []}
        />
      )}

      {showImportModal && (
        <ImportClassesDialog
          open={showImportModal}
          onOpenChange={setShowImportModal}
        />
      )}
    </div>
  )
}
