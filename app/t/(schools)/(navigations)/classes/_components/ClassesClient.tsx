'use client'

import type { IClass, IGrade } from '@/types'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import {
  ClassCreationOrUpdateDialog,
  ClassesFilters,
  ClassesGrid,
  ClassesTable,
  ImportClassesDialog,
} from './index'

interface ClassesClientProps {
  grades: IGrade[]
  classes: IClass[]
  totalPages: number
  currentPage: number
  searchParams: {
    grade?: string
    search?: string
    active?: string
    teacher?: string
    page?: string
  }
}

export default function ClassesClient({
  grades,
  classes,
  totalPages,
  currentPage,
  searchParams,
}: ClassesClientProps) {
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)

  // Handlers for filters (these should update the URL/searchParams for SSR navigation)
  // For now, just placeholders; in a real app, use router.push or similar
  const handleGradeChange = (_grade?: string) => {}
  const handleSearchChange = (_search: string) => {}
  const handleActiveChange = (_active?: boolean) => {}
  const handleTeacherChange = (_teacher?: boolean) => {}

  const handleClassEdit = (classData: string) => {
    const parsedClass = JSON.parse(classData)
    setClassToEdit(parsedClass)
    setShowClassModal(true)
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Button
          variant="outline"
          aria-label="New Class"
          onClick={() => setShowClassModal(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Nouvelle classe
        </Button>
      </div>
      <ClassesFilters
        grades={grades}
        selectedGrade={searchParams.grade}
        onGradeChange={handleGradeChange}
        searchTerm={searchParams.search || ''}
        onSearchTermChange={handleSearchChange}
        classesActiveState={searchParams.active === 'true' ? true : searchParams.active === 'false' ? false : undefined}
        onClassesActiveStateChange={handleActiveChange}
        hasMainTeacher={searchParams.teacher === 'true' ? true : searchParams.teacher === 'false' ? false : undefined}
        onHasMainTeacherChange={handleTeacherChange}
        isTableViewMode={isTableViewMode}
        onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
        onImportClick={() => setShowImportModal(true)}
        onExportClick={() => {}}
        onArchiveClick={() => {}}
      />
      {isTableViewMode
        ? (
            <ClassesTable
              classes={classes}
              isLoading={false}
              onClassEdit={handleClassEdit}
            />
          )
        : (
            <ClassesGrid
              classes={classes}
              isLoading={false}
              onClassEdit={handleClassEdit}
            />
          )}
      <Pagination currentPage={currentPage} totalPages={totalPages} />
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
        <ImportClassesDialog open={showImportModal} onOpenChange={setShowImportModal} />
      )}
    </>
  )
}
