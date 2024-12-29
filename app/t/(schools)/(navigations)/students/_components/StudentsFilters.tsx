'use client'
import type { IClass } from '@/types'
import { ClassSelect } from '@/components/ClassSelect'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColumnsIcon, FileDown, FileUp, ListChecks, ListTree } from 'lucide-react'
import React from 'react'

interface StudentsFiltersProps {
  classes: IClass[]
  searchTerm: string
  onSearchTermChange: (searchTerm: string) => void
  selectedClassesId?: string[]
  onClassChange: (classIds?: string[]) => void
  hasNotParentFilter: boolean
  onHasNotParentFilterChange: (value: boolean) => void
  hasNotClassFilter: boolean
  onHasNotClassFilterChange: (value: boolean) => void
  isTableViewMode: boolean
  onToggleViewMode: () => void
  onImportClick: () => void
  onExportClick: () => void
  onArchiveClick: () => void
}

interface FilterCheckboxProps {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function FilterCheckbox({ id, label, checked, onChange }: FilterCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

interface ActionButtonProps {
  onClick: () => void
  icon: React.ReactElement<{ 'className'?: string, 'aria-hidden'?: string }>
  className?: string
  label: string
}

function ActionButton({ onClick, icon, label, className }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center ${className}`}
    >
      {React.cloneElement(icon, {
        'className': 'mr-2 h-4 w-4',
        'aria-hidden': 'true',
      })}
      {label}
    </Button>
  )
}

export const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  classes,
  searchTerm,
  onSearchTermChange,
  selectedClassesId,
  onClassChange,
  hasNotParentFilter,
  onHasNotParentFilterChange,
  hasNotClassFilter,
  onHasNotClassFilterChange,
  isTableViewMode,
  onToggleViewMode,
  onImportClick,
  onExportClick,
  onArchiveClick,
}) => {
  const actionButtons = [
    {
      onClick: onToggleViewMode,
      icon: isTableViewMode ? <ColumnsIcon /> : <ListTree />,
      label: isTableViewMode ? 'Vue Grille' : 'Vue Tableau',
    },
    {
      onClick: onImportClick,
      icon: <FileUp />,
      label: 'Importer',
    },
    {
      onClick: onExportClick,
      icon: <FileDown />,
      label: 'Exporter',
    },
    {
      onClick: onArchiveClick,
      icon: <ListChecks />,
      label: 'Archiver',
    },
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
        <Input
          placeholder="Rechercher par nom ou CIN..."
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="flex-1"
        />
        <ClassSelect
          classes={classes}
          onClassChange={onClassChange}
          selectedClassesId={selectedClassesId}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actionButtons.map((button, index) => (
          <ActionButton
            key={index}
            {...button}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <FilterCheckbox
          id="has-not-parent"
          label="Sans parent"
          checked={hasNotParentFilter}
          onChange={onHasNotParentFilterChange}
        />
        <FilterCheckbox
          id="has-not-class"
          label="Sans classe"
          checked={hasNotClassFilter}
          onChange={onHasNotClassFilterChange}
        />
      </div>
    </div>
  )
}
