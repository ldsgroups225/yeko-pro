'use client'
import type { IClass } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

interface ClassSelectProps {
  classes: IClass[] | undefined
  onClassChange: (classIds?: string[]) => void
  selectedClassesId?: string[]
}

export const ClassSelect: React.FC<ClassSelectProps> = ({
  classes,
  onClassChange,
  selectedClassesId = [],
}) => {
  const [open, setOpen] = useState(false)

  const toggleClass = (classId: string) => {
    const newSelection = selectedClassesId.includes(classId)
      ? selectedClassesId.filter(id => id !== classId)
      : [...selectedClassesId, classId]

    onClassChange(newSelection.length > 0 ? newSelection : undefined)
  }

  const getSelectedClassesText = () => {
    if (!selectedClassesId?.length)
      return 'Sélectionner des classes'

    const selectedClasses = classes?.filter(c => selectedClassesId.includes(c.id))
    if (selectedClasses?.length === 1)
      return selectedClasses[0].name
    return `${selectedClasses?.length} classes sélectionnées`
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[280px] justify-between"
        >
          {getSelectedClassesText()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0">
        <Command>
          <CommandInput placeholder="Rechercher une classe..." />
          <CommandEmpty>Aucune classe trouvée.</CommandEmpty>
          <CommandGroup>
            {classes?.map(classe => (
              <CommandItem
                key={classe.id}
                value={classe.id}
                onSelect={() => {
                  toggleClass(classe.id)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedClassesId.includes(classe.id) ? 'opacity-100' : 'opacity-0',
                  )}
                />
                {classe.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
