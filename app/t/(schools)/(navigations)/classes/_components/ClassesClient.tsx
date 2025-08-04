'use client'

import type { IClass, IGrade } from '@/types'

import { PlusIcon } from '@radix-ui/react-icons'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Pagination } from '@/components/Pagination'
import { Button } from '@/components/ui/button'
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
  const router = useRouter()
  const pathname = usePathname()
  const currentSearchParams = useSearchParams()

  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)

  const updateUrlParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(currentSearchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        params.delete(key)
      }
      else {
        params.set(key, value)
      }
    })

    // Reset to page 1 when filters change
    params.delete('page')

    const search = params.toString()
    router.push(`${pathname}${search ? `?${search}` : ''}`)
  }

  const handleGradeChange = (grade?: string) => {
    updateUrlParams({ grade })
  }

  const debouncedSearchUpdate = useDebouncedCallback((search: string) => {
    updateUrlParams({ search })
  }, 300)

  const handleSearchChange = (search: string) => {
    debouncedSearchUpdate(search)
  }

  const handleActiveChange = (active?: boolean) => {
    updateUrlParams({ active: active?.toString() })
  }

  const handleTeacherChange = (teacher?: boolean) => {
    updateUrlParams({ teacher: teacher?.toString() })
  }

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
          data-testid="new-class-btn"
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
        toggleViewModeTestId="toggle-view-mode-btn"
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
