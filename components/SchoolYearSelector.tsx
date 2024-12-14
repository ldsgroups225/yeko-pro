import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'

interface SchoolYearSelectorProps {
  onYearChange: (year: string) => void
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
  const [selectedYear, setSelectedYear] = useState<string>('2024-2025')

  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    onYearChange(year)
  }

  return (
    <Select value={selectedYear} onValueChange={handleYearChange}>
      <SelectTrigger className="w-[180px] text-secondary" aria-label="School Year">
        <SelectValue placeholder="Année scolaire" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="2024-2025">2024-2025</SelectItem>
        <SelectItem value="2023-2024">2023-2024</SelectItem>
        <SelectItem value="2022-2023">2022-2023</SelectItem>
      </SelectContent>
    </Select>
  )
}
