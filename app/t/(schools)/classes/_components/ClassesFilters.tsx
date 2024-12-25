import type { IGrade } from '@/types'
import { ActionsAndViewModeToggle } from '@/components/ActionsAndViewModeToggle'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useEffect, useState } from 'react'

interface ClassesFiltersProps {
  grades?: IGrade[] | null
  initialFilters: {
    grade?: string
    search?: string
    active?: boolean
    teacher?: boolean
  }
  onFilterChange: (filters: Partial<ClassesFiltersProps['initialFilters']>) => void
  isTableViewMode: boolean
  onToggleViewMode: () => void
  onImportClick: () => void
  onExportClick: () => void
  onArchiveClick: () => void
}

/**
 * Component for filtering classes.
 *
 * @param {ClassesFiltersProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesFilters: React.FC<ClassesFiltersProps> = ({
  grades,
  initialFilters,
  onFilterChange,
  isTableViewMode,
  onToggleViewMode,
  onImportClick,
  onExportClick,
  onArchiveClick,
}) => {
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  const handleGradeChange = (gradeId?: string) => {
    const newFilters = { ...filters, grade: gradeId }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearchTermChange = (term: string) => {
    const newFilters = { ...filters, search: term }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleClassesActiveStateChange = (isActive: boolean | undefined) => {
    const newFilters = { ...filters, active: isActive }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleHasMainTeacherChange = (hasTeacher: boolean | undefined) => {
    const newFilters = { ...filters, teacher: hasTeacher }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <label htmlFor="grade-select" className="text-sm font-medium block mb-2">
            Niveau
          </label>
          <Select
            value={filters.grade || 'all'}
            onValueChange={handleGradeChange as any}
          >
            <SelectTrigger aria-label="Select Grade">
              <SelectValue placeholder="Choisir un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {grades
              && grades.map(grade => (
                <SelectItem key={grade?.id} value={(grade?.id ?? '').toString()}>
                  {`Niveau ${grade?.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="search-input" className="text-sm font-medium block mb-2">
            Recherche
          </label>
          <Input
            id="search-input"
            type="text"
            placeholder="Rechercher une classe..."
            value={filters.search}
            onChange={e => handleSearchTermChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <>
              <label htmlFor="status-filter" className="text-sm font-medium">
                Statut:
              </label>
              <Select
                value={
                  filters.active === undefined ? 'all' : filters.active.toString()
                }
                onValueChange={value =>
                  handleClassesActiveStateChange(
                    value === 'all' ? undefined : value === 'true',
                  )}
              >
                <SelectTrigger className="w-[180px]" aria-label="Filter by Status">
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">Actif</SelectItem>
                  <SelectItem value="false">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </>

            <>
              <label
                htmlFor="has-main-teacher-filter"
                className="text-sm font-medium"
              >
                PP:
              </label>
              <Select
                value={
                  filters.teacher === undefined ? 'all' : filters.teacher.toString()
                }
                onValueChange={value =>
                  handleHasMainTeacherChange(
                    value === 'all' ? undefined : value === 'true',
                  )}
              >
                <SelectTrigger
                  className="w-[180px]"
                  aria-label="Filter by Main Teacher"
                >
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="true">Avec PP</SelectItem>
                  <SelectItem value="false">Sans PP</SelectItem>
                </SelectContent>
              </Select>
            </>
          </div>

          <ActionsAndViewModeToggle
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => onToggleViewMode()}
            onArchive={onArchiveClick}
            onDownload={onExportClick}
            onUpload={onImportClick}
          />
        </div>
      </div>
    </>
  )
}
