'use client'

import type { GradeId, IClass } from '@/types'
import { Pagination } from '@/components/Pagination'
import { SchoolYearSelector } from '@/components/SchoolYearSelector'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useClassesData, useSchool } from '@/hooks'
import { PersonIcon, PlusIcon } from '@radix-ui/react-icons'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
  ClassCreationOrUpdateDialog,
  ClassesFilters,
  ClassesGrid,
  ClassesTable,
} from './_components'

const ITEMS_PER_PAGE = 10

/**
 * Main component for the Classes page.
 *
 * @returns {JSX.Element} The rendered component.
 */
export default function ClassesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isTableViewMode, setIsTableViewMode] = useState(true)
  const [showClassModal, setShowClassModal] = useState(false)
  const [localeSearch, setLocaleSearch] = useState('')
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
    searchTerm,
    setSearchTerm,
    classesActiveState,
    setClassesActiveState,
    hasMainTeacher,
    setHasMainTeacher,
  } = useClassesData({
    initialItemsPerPage: ITEMS_PER_PAGE,
    initialGrade: (searchParams.get('grade') as GradeId) || undefined,
    initialSearchTerm: searchParams.get('search') || '',
    initialClassesActiveState: searchParams.has('active')
      ? searchParams.get('active') === 'true'
      : undefined,
    initialHasMainTeacher: searchParams.has('teacher')
      ? searchParams.get('teacher') === 'true'
      : undefined,
  })

  const { error: schoolError } = useSchool()

  const createQueryString = useCallback(
    (params: Record<string, string>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === '' || value === 'all') {
          newSearchParams.delete(key)
        }
        else {
          newSearchParams.set(key, value)
        }
      }
      return newSearchParams.toString()
    },
    [searchParams],
  )

  const updateSearchParams = useDebouncedCallback(
    (params: Record<string, any>) => {
      const queryString = createQueryString(params)
      router.push(`${pathname}?${queryString}`, { scroll: false })
    },
    500,
  )

  useEffect(() => {
    const params: Record<string, any> = {
      grade: selectedGrade,
      active: classesActiveState?.toString(),
      teacher: hasMainTeacher?.toString(),
    }
    if (searchTerm !== searchParams.get('search')) {
      params.search = searchTerm
    }
    updateSearchParams(params)
  }, [
    selectedGrade,
    classesActiveState,
    hasMainTeacher,
    searchTerm,
    updateSearchParams,
    searchParams,
  ])

  useEffect(() => {
    setSelectedGrade((searchParams.get('grade') as GradeId) || undefined)
    setLocaleSearch(searchParams.get('search') || '')
    setClassesActiveState(
      searchParams.has('active')
        ? searchParams.get('active') === 'true'
        : undefined,
    )
    setHasMainTeacher(
      searchParams.has('teacher')
        ? searchParams.get('teacher') === 'true'
        : undefined,
    )
  }, [
    searchParams,
    setSelectedGrade,
    setClassesActiveState,
    setHasMainTeacher,
    setLocaleSearch,
  ])

  const handleSearchChange = useDebouncedCallback(
    (newLocaleSearch: string) => {
      setSearchTerm(newLocaleSearch)
    },
    500,
  )

  useEffect(() => {
    handleSearchChange(localeSearch)
  }, [localeSearch, handleSearchChange])

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
          <Button variant="outline" size="icon" aria-label="Profile">
            <PersonIcon width={16} height={16} className="text-secondary" />
          </Button>
          <SchoolYearSelector onYearChange={() => {}} />
        </div>
      </div>

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
          <ClassesFilters
            grades={grades}
            selectedGrade={selectedGrade || ''}
            onGradeChange={value => setSelectedGrade(value as GradeId)}
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
          {isTableViewMode
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
              )}

          {status !== 'LoadingFirstPage' && (
            <Pagination
              currentPage={currentPage}
              totalPages={status === 'Exhausted' ? currentPage : currentPage + 1}
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
            ? {
                id: classToEdit._id,
                name: classToEdit.name,
                gradeId: classToEdit.gradeId,
              }
            : undefined
        }
        onOpenChange={setShowClassModal}
        gradeOptions={grades ?? []}
      />
    </div>
  )
}
