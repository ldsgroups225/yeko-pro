'use client'

import type { IGrade, ISubject } from '@/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchoolYear } from '@/hooks'

interface ProgressReportFiltersProps {
  grades: IGrade[]
  subjects: ISubject[]
  initialFilters: {
    gradeId?: number
    subjectId?: string
    schoolYearId?: number
    // isCompleted?: boolean
  }
}

export function ProgressReportFilters({
  grades,
  subjects,
  initialFilters,
}: ProgressReportFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { selectedSchoolYearId } = useSchoolYear()

  const createQueryString = useCallback(
    (params: Record<string, string | number | boolean | null | undefined>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined || value === 'all') {
          newSearchParams.delete(key)
        }
        else {
          newSearchParams.set(key, String(value))
        }
      }
      newSearchParams.set('page', '1') // Reset page on filter change
      return newSearchParams.toString()
    },
    [searchParams],
  )

  const handleFilterChange = useCallback(
    (key: string, value: string | number | boolean | null | undefined) => {
      const queryString = createQueryString({ [key]: value })
      router.push(`${pathname}?${queryString}`)
    },
    [createQueryString, pathname, router],
  )

  useEffect(() => handleFilterChange('schoolYearId', selectedSchoolYearId), [selectedSchoolYearId])

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      {/* Grade Filter */}
      <Select
        value={initialFilters.gradeId?.toString() ?? ''}
        onValueChange={value => handleFilterChange('gradeId', value === 'all' ? null : Number(value))}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Niveau" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les niveaux</SelectItem>
          {grades.map(grade => (
            <SelectItem key={grade.id} value={grade.id.toString()}>
              {grade.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Subject Filter */}
      <Select
        value={initialFilters.subjectId ?? ''}
        onValueChange={value => handleFilterChange('subjectId', value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Matière" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les matières</SelectItem>
          {subjects.map(subject => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Completion Status Filter */}
      {/* <Select
        value={initialFilters.isCompleted === undefined ? 'all' : String(initialFilters.isCompleted)}
        onValueChange={value => handleFilterChange('isCompleted', value === 'all' ? null : value === 'true')}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="true">Terminé</SelectItem>
          <SelectItem value="false">En cours</SelectItem>
        </SelectContent>
      </Select> */}

      {/* Optional: Reset Button */}
      <Button
        variant="outline"
        onClick={() => router.push(pathname)} // Clears all search params
        disabled={!searchParams.toString()}
      >
        Réinitialiser
      </Button>
    </div>
  )
}
