'use client'

import type { IClass } from '@/types'
import { Pagination } from '@/components/Pagination'
import { SchoolYearSelector } from '@/components/SchoolYearSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClassesData, useSchool } from '@/hooks'
import { PersonIcon, PlusIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { ClassCreationOrUpdateDialog, ClassesFilters, ClassesGrid, ClassesTable } from './_components'

const ITEMS_PER_PAGE = 10

/**
 * Main component for the Classes page.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function ClassesPage() {
  const [_selectedYear, setSelectedYear] = useState<string>('2024-2025')
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [localeSearch, setLocaleSearch] = useState('')
  const [showClassModal, setShowClassModal] = useState(false)
  const [classToEdit, setClassToEdit] = useState<IClass | null>(null)

  const {
    grades,
    results,
    status,
    loadMore,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    selectedGrade,
    setSelectedGrade,
    classesActiveState,
    setClassesActiveState,
    setSearchTerm,
    hasMainTeacher,
    setHasMainTeacher,
  } = useClassesData({ initialItemsPerPage: ITEMS_PER_PAGE })

  const { error: schoolError } = useSchool()

  const handleSearch = useDebouncedCallback((term: string) => {
    setSearchTerm(term)
  }, 500)

  useEffect(() => {
    handleSearch(localeSearch)
  }, [localeSearch])

  if (schoolError) {
    return (
      <div>
        Error loading school:
        {schoolError.message}
      </div>
    )
  }

  return (
    <div className="space-y-2 px-6 py-2 bg-orange-50">
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Profile"
          >
            <PersonIcon width={16} height={16} className="text-secondary" />
          </Button>
          <SchoolYearSelector onYearChange={setSelectedYear} />
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Liste des classes</CardTitle>
          <Button variant="outline" aria-label="New Class" onClick={() => setShowClassModal(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            {' '}
            Nouvelle classe
          </Button>
        </CardHeader>
        <CardContent className="px-6 py-3">
          <ClassesFilters
            grades={grades}
            selectedGrade={selectedGrade}
            onGradeChange={value =>
              setSelectedGrade(value === '' ? undefined : value)}
            searchTerm={localeSearch}
            onSearchTermChange={setLocaleSearch}
            classesActiveState={classesActiveState}
            onClassesActiveStateChange={setClassesActiveState}
            hasMainTeacher={hasMainTeacher}
            onHasMainTeacherChange={setHasMainTeacher}
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => setIsTableViewMode(!isTableViewMode)}
          />

          {/* Conditional Rendering based on View Mode */}
          {(
            isTableViewMode
              ? (
                  <ClassesTable
                    classes={results}
                    isLoading={status === 'LoadingFirstPage'}
                    onClassEdit={(val: string) => {
                      setClassToEdit(JSON.parse(val))
                      return setShowClassModal(true)
                    }}
                  />
                )
              : (
                  <ClassesGrid
                    classes={results}
                    isLoading={status === 'LoadingFirstPage'}
                    onClassEdit={(val: string) => {
                      setClassToEdit(JSON.parse(val))
                      return setShowClassModal(true)
                    }}
                  />
                )
          )}

          {/* Pagination Controls */}
          {status !== 'LoadingFirstPage' && (
            <Pagination
              currentPage={currentPage}
              totalPages={
                status === 'Exhausted' ? currentPage : currentPage + 1
              }
              onPageChange={(newPage) => {
                if (newPage > currentPage) {
                  loadMore(itemsPerPage)
                }
                setCurrentPage(newPage)
              }}
            />
          )}
        </CardContent>
      </Card>

      <ClassCreationOrUpdateDialog
        open={showClassModal}
        oldClass={
          classToEdit
            ? { id: classToEdit._id, name: classToEdit.name, gradeId: classToEdit.gradeId }
            : undefined
        }
        onOpenChange={setShowClassModal}
        gradeOptions={grades ?? []}
      />
    </div>
  )
}
