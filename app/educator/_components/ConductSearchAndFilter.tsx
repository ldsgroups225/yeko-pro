'use client'

import type { IConductQueryParams, IConductStudent } from '../types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  EducatorConductFilters,
  EducatorConductStudentsTable,
} from '.'
import { useEducatorConduct } from '../hooks'

interface Props {
  students: IConductStudent[]
  initialSearchTerm?: string
  initialFilters?: IConductQueryParams
}

export function ConductSearchAndFilter({ students, initialSearchTerm = '', initialFilters }: Props) {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    isLoading,
    totalCount,
    currentPage,
    totalPages,
    filters,
    fetchStudents,
    setFilters,
    setCurrentPage,
  } = useEducatorConduct()

  // Initialize filters from URL parameters on mount
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters, setFilters])

  // Initialize search term from URL parameters on mount
  useEffect(() => {
    if (initialSearchTerm && initialSearchTerm !== searchTerm) {
      setSearchTerm(initialSearchTerm)
    }
  }, [initialSearchTerm, searchTerm])

  // Update URL when filters change
  const updateURL = useDebouncedCallback((newFilters: Partial<IConductQueryParams>) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove parameters based on new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key)
      }
      else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value))
      }
      else {
        params.set(key, String(value))
      }
    })

    const search = params.toString()
    const newURL = search ? `${pathname}?${search}` : pathname
    router.push(newURL)
  }, 300)

  // Filter handlers
  const handleSearchTermChange = useDebouncedCallback((searchTerm: string) => {
    const newFilters = { searchTerm: searchTerm || undefined, page: 1 }
    setFilters(newFilters)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
  }, 500, { maxWait: 1200 })

  const handleSort = (field: string) => {
    const newSort = {
      column: field,
      direction: filters.sort?.direction === 'asc' ? 'desc' : 'asc',
    } as const
    const newFilters = { sort: newSort }
    setFilters(newFilters)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
  }

  const handlePageChange = (page: number) => {
    const newFilters = { page }
    setCurrentPage(page)
    fetchStudents({ ...filters, ...newFilters })
    updateURL(newFilters)
  }

  // Action handlers
  const handleAddIncident = (studentId: string) => {
    console.warn(studentId)
    // setSelectedStudentId(studentId)
    // setShowIncidentModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border-0 bg-gradient-to-br from-background/95 via-card/90 to-accent/20 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6">
          <EducatorConductFilters
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

      {/* Students Table/Cards */}
      <EducatorConductStudentsTable
        students={students}
        isLoading={isLoading}
        onSort={handleSort}
        onAddIncident={handleAddIncident}
        sortColumn={filters.sort?.column}
        sortDirection={filters.sort?.direction}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
            >
              Précédent
            </Button>
            <span className="text-sm text-muted-foreground">
              Page
              {' '}
              {currentPage}
              {' '}
              sur
              {' '}
              {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
