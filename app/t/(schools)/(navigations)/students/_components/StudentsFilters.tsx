import { ColumnsIcon, FileDown, FileUp, ListChecks, ListTree } from 'lucide-react'
import { nanoid } from 'nanoid'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StudentsFiltersProps {
  searchTerm: string
  onSearchTermChange: (searchTerm: string) => void
  isTableViewMode: boolean
  onToggleViewMode: () => void
  onImportClick: () => void
  onExportClick: () => void
  onArchiveClick: () => void
}

interface ActionButtonProps {
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  className?: string
  label: string
}

function ActionButton({ onClick, icon: Icon, label, className }: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`flex items-center ${className}`}
    >
      <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  )
}

export const StudentsFilters: React.FC<StudentsFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  isTableViewMode,
  onToggleViewMode,
  onImportClick,
  onExportClick,
  onArchiveClick,
}) => {
  const actionButtons = [
    {
      onClick: onToggleViewMode,
      icon: isTableViewMode ? ColumnsIcon : ListTree,
      label: isTableViewMode ? 'Vue Grille' : 'Vue Tableau',
    },
    {
      onClick: onImportClick,
      icon: FileUp,
      label: 'Importer',
    },
    {
      onClick: onExportClick,
      icon: FileDown,
      label: 'Exporter',
    },
    {
      onClick: onArchiveClick,
      icon: ListChecks,
      label: 'Archiver',
    },
  ]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
        <Input
          placeholder="Rechercher par nom ou matricule.."
          value={searchTerm}
          onChange={e => onSearchTermChange(e.target.value)}
          className="flex-1"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actionButtons.map(button => (
          <ActionButton
            key={nanoid()}
            {...button}
          />
        ))}
      </div>
    </div>
  )
}
