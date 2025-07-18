import { useEffect, useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSchoolYear } from '@/hooks'

interface SchoolYearSelectorProps {
  onYearChange: (year: number) => void
}

/**
 * Component for selecting the school year.
 *
 * @param {SchoolYearSelectorProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const SchoolYearSelector: React.FC<SchoolYearSelectorProps> = ({
  onYearChange,
}) => {
  const { schoolYears, selectedSchoolYearId, setSelectedSchoolYearId }
    = useSchoolYear()

  const isAlreadyMounted = useRef(false)

  useEffect(() => {
    if (schoolYears.length > 0 && !isAlreadyMounted.current) {
      setSelectedSchoolYearId(schoolYears[0].id)
    }
    isAlreadyMounted.current = true
  }, [schoolYears])

  const handleYearChange = (year: number) => {
    setSelectedSchoolYearId(year)
    onYearChange(year)
  }

  return (
    <Select
      value={selectedSchoolYearId.toString()}
      onValueChange={(val: string) => handleYearChange(Number.parseInt(val))}
    >
      <SelectTrigger className="w-[180px] text-secondary" aria-label="School Year">
        <SelectValue placeholder="Année scolaire" />
      </SelectTrigger>
      <SelectContent>
        {schoolYears.map(year => (
          <SelectItem key={year.id} value={year.id.toString()}>
            {year.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
