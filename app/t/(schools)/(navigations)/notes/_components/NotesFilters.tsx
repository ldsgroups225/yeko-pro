'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NOTE_OPTIONS } from '@/constants/noteTypes'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'

interface NotesFiltersProps {
  classes: any[]
  subjects: any[]
  semesters: any[]
}

export function NotesFilters({ classes, subjects, semesters }: NotesFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams?.get('searchTerm') || '')

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
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

  const handleSearch = useDebounceCallback((term: string) => {
    const queryString = createQueryString({
      searchTerm: term || null,
      page: '1',
    })
    router.push(`${pathname}?${queryString}`)
  }, 500)

  const handleFilterChange = useCallback((key: string, value: string | null) => {
    const queryString = createQueryString({
      [key]: value,
      page: '1',
    })
    router.push(`${pathname}?${queryString}`)
  }, [createQueryString, pathname, router])

  useEffect(() => {
    if (searchTerm !== searchParams?.get('searchTerm')) {
      handleSearch(searchTerm)
    }
  }, [searchTerm])

  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
      <Input
        placeholder="Rechercher une note..."
        className="max-w-sm"
        onChange={e => setSearchTerm(e.target.value)}
        value={searchTerm}
      />

      <Select
        onValueChange={value => handleFilterChange('classId', value)}
        value={searchParams?.get('classId') ?? undefined}
      >
        <SelectTrigger className="max-w-[200px]">
          <SelectValue placeholder="Classe" />
        </SelectTrigger>
        <SelectContent>
          {classes.map(classItem => (
            <SelectItem key={classItem.id} value={classItem.id}>
              {classItem.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={value => handleFilterChange('subjectId', value)}
        value={searchParams?.get('subjectId') ?? undefined}
      >
        <SelectTrigger className="max-w-[200px]">
          <SelectValue placeholder="Matière" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map(subject => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={value => handleFilterChange('semesterId', value)}
        value={searchParams?.get('semesterId') ?? undefined}
      >
        <SelectTrigger className="max-w-[200px]">
          <SelectValue placeholder="Semestre" />
        </SelectTrigger>
        <SelectContent>
          {semesters.map(semester => (
            <SelectItem key={semester.id} value={semester.id.toString()}>
              {semester.semester_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={value => handleFilterChange('noteType', value)}
        value={searchParams?.get('noteType') ?? undefined}
      >
        <SelectTrigger className="max-w-[200px]">
          <SelectValue placeholder="Type de note" />
        </SelectTrigger>
        <SelectContent>
          {NOTE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
