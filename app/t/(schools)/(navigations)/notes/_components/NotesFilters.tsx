'use client'

import { Combobox } from '@/components/Combobox'
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

interface IOption {
  id: string
  name: string
}

interface NotesFiltersProps {
  classes: IOption[]
  subjects: IOption[]
  semesters: { id: number, name: string }[]
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

      <Combobox
        options={classes}
        value={searchParams?.get('classId') ?? undefined}
        onSelect={option => handleFilterChange('classId', option.id)}
        placeholder="Classe"
        emptyText="Aucune classe trouvée"
        className="max-w-[200px]"
      />

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
              {semester.name}
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
