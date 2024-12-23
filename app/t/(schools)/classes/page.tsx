'use client'

import type { IClass } from '@/types'
import { Pagination } from '@/components/Pagination'
import { SchoolYearSelector } from '@/components/SchoolYearSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClassesData } from '@/hooks'
import { PersonIcon, PlusIcon } from '@radix-ui/react-icons'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  ClassCreationOrUpdateDialog,
  ClassesFilters,
  ClassesGrid,
  ClassesTable,
  ImportClassesDialog,
} from './_components'

const ITEMS_PER_PAGE = 12

export default function ClassesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local UI state
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [localeSearch, setLocaleSearch] = useState('')
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)

  // Initialize classes data with URL params
  const {
    grades,
    results,
    status,
    loadMore,
    currentPage,
    setCurrentPage,
    // itemsPerPage,
    selectedGrade,
    setSelectedGrade,
    searchTerm,
    setSearchTerm,
    classesActiveState,
    setClassesActiveState,
    hasMainTeacher,
    setHasMainTeacher,
  } = useClassesData({
    initialItemsPerPage: ITEMS_PER_PAGE,
    initialGrade: searchParams.get('grade') || undefined,
    initialSearchTerm: searchParams.get('search') || '',
    initialClassesActiveState: searchParams.has('active')
      ? searchParams.get('active') === 'true'
      : undefined,
    initialHasMainTeacher: searchParams.has('teacher')
      ? searchParams.get('teacher') === 'true'
      : undefined,
  })

  // URL handling
  const createQueryString = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === 'all') {
        newSearchParams.delete(key)
      }
      else {
        newSearchParams.set(key, value)
      }
    })

    return newSearchParams.toString()
  }, [searchParams])

  const updateSearchParams = useDebouncedCallback((params: Record<string, any>) => {
    const queryString = createQueryString(params)
    router.push(`${pathname}?${queryString}`, { scroll: false })
  }, 500)

  // Sync filters with URL
  useEffect(() => {
    const params: Record<string, any> = {
      grade: selectedGrade,
      active: classesActiveState?.toString(),
      teacher: hasMainTeacher?.toString(),
      ...(searchTerm !== searchParams.get('search') && { search: searchTerm }),
    }
    updateSearchParams(params)
  }, [selectedGrade, classesActiveState, hasMainTeacher, searchTerm, searchParams])

  // Sync URL params with state
  useEffect(() => {
    setSelectedGrade(searchParams.get('grade') || undefined)
    setLocaleSearch(searchParams.get('search') || '')
    setClassesActiveState(searchParams.has('active')
      ? searchParams.get('active') === 'true'
      : undefined)
    setHasMainTeacher(searchParams.has('teacher')
      ? searchParams.get('teacher') === 'true'
      : undefined)
  }, [searchParams])

  // Debounced search handling
  const handleSearchChange = useDebouncedCallback((newLocaleSearch: string) => {
    setSearchTerm(newLocaleSearch)
  }, 500)

  useEffect(() => {
    handleSearchChange(localeSearch)
  }, [localeSearch])

  // Handlers
  const handleClassEdit = (classData: string) => {
    const parsedClass = JSON.parse(classData)
    setClassToEdit(parsedClass)
    setShowClassModal(true)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage > currentPage) {
      // loadMore(itemsPerPage)
      loadMore()
    }
    setCurrentPage(newPage)
  }

  return (
    <div className="space-y-2 px-6 py-2 bg-orange-50">
      {/* Header */}
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" aria-label="Profile">
            <PersonIcon width={16} height={16} className="text-secondary" />
          </Button>
          <SchoolYearSelector onYearChange={() => {}} />
        </div>
      </div>

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
            {' '}
            Nouvelle classe
          </Button>
        </CardHeader>

        <CardContent className="px-6 py-3">
          {/* Filters */}
          <ClassesFilters
            grades={grades}
            selectedGrade={selectedGrade || ''}
            onGradeChange={setSelectedGrade}
            searchTerm={localeSearch}
            onSearchTermChange={setLocaleSearch}
            classesActiveState={classesActiveState}
            onClassesActiveStateChange={setClassesActiveState}
            hasMainTeacher={hasMainTeacher}
            onHasMainTeacherChange={setHasMainTeacher}
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
          {(status !== 'idle' && status !== 'loading') && (
            <Pagination
              currentPage={currentPage}
              totalPages={status === 'success' ? currentPage : currentPage + 1}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showClassModal && (
        <ClassCreationOrUpdateDialog
          open={showClassModal}
          oldClass={classToEdit
            ? {
                id: classToEdit.id,
                name: classToEdit.name,
                gradeId: classToEdit.gradeId,
              }
            : undefined}
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
