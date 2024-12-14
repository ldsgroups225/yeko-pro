import { ActionsAndViewModeToggle } from '@/components/ActionsAndViewModeToggle'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataModel, Id } from '@/convex/_generated/dataModel'
import { is } from 'date-fns/locale'
import React from 'react'

type IGrade = DataModel['grades']['document']

interface ClassesFiltersProps {
  grades?: IGrade[] | null
  selectedGrade: Id<'grades'> | undefined
  onGradeChange: (gradeId: Id<'grades'> | undefined) => void
  searchTerm: string
  onSearchTermChange: (term: string) => void
  classesActiveState: boolean | undefined
  onClassesActiveStateChange: (isActive: boolean | undefined) => void
  hasMainTeacher: boolean | undefined
  onHasMainTeacherChange: (hasTeacher: boolean | undefined) => void
  isTableViewMode: boolean
  onToggleViewMode: () => void
}

/**
 * Component for filtering classes.
 *
 * @param {ClassesFiltersProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesFilters: React.FC<ClassesFiltersProps> = ({
  grades,
  selectedGrade,
  onGradeChange,
  searchTerm,
  onSearchTermChange,
  classesActiveState,
  onClassesActiveStateChange,
  hasMainTeacher,
  onHasMainTeacherChange,
  isTableViewMode,
  onToggleViewMode,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <label
            htmlFor="grade-select"
            className="text-sm font-medium block mb-2"
          >
            Niveau
          </label>
          <Select value={selectedGrade} onValueChange={onGradeChange as any}>
            <SelectTrigger aria-label="Select Grade">
              <SelectValue placeholder="Choisir un niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={''}>Tous les niveaux</SelectItem>
              {grades &&
                grades.map((grade) => (
                  <SelectItem
                    key={grade?._id}
                    value={(grade?._id ?? '').toString()}
                  >
                    {`Niveau ${grade?.name}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="search-input"
            className="text-sm font-medium block mb-2"
          >
            Recherche
          </label>
          <Input
            id="search-input"
            type="text"
            placeholder="Rechercher une classe..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <>
              <label
                htmlFor="status-filter"
                className="text-sm font-medium"
              >
                Statut:
              </label>
              <Select
                value={
                  classesActiveState === undefined
                    ? ''
                    : classesActiveState.toString()
                }
                onValueChange={(value) =>
                  onClassesActiveStateChange(
                    value === '' ? undefined : value === 'true'
                  )
                }
              >
                <SelectTrigger
                  className="w-[180px]"
                  aria-label="Filter by Status"
                >
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
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
                  hasMainTeacher === undefined ? '' : hasMainTeacher.toString()
                }
                onValueChange={(value) =>
                  onHasMainTeacherChange(
                    value === '' ? undefined : value === 'true'
                  )
                }
              >
                <SelectTrigger
                  className="w-[180px]"
                  aria-label="Filter by Main Teacher"
                >
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous</SelectItem>
                  <SelectItem value="true">Avec PP</SelectItem>
                  <SelectItem value="false">Sans PP</SelectItem>
                </SelectContent>
              </Select>
            </>
          </div>

          <ActionsAndViewModeToggle
            isTableViewMode={isTableViewMode}
            onToggleViewMode={() => onToggleViewMode()}
            onArchive={() => console.log('Archive clicked')}
            onDownload={() => console.log('Download clicked')}
            onUpload={() => console.log('Upload clicked')}
          />
        </div>
      </div>
    </>
  )
}
