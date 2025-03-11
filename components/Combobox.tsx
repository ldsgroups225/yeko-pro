import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import React, { useCallback, useState } from 'react'

interface ComboboxProps<T extends { id: string, name: string }> {
  value?: string
  options: T[]
  onSelect: (option: T) => void
  label?: string
  placeholder?: string
  emptyText?: string
  isLoading?: boolean
  onSearchChange?: (search: string) => void
  className?: string
  inputClassName?: string
  disabled?: boolean
  required?: boolean
}

export function Combobox<T extends { id: string, name: string }>({
  value,
  options,
  onSelect,
  label,
  placeholder = 'Sélectionnez une option',
  emptyText = 'Aucun résultat trouvé',
  isLoading = false,
  onSearchChange,
  className,
  inputClassName,
  disabled = false,
  required = false,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [touched, setTouched] = useState(false)

  const handleSearchChange = useCallback((searchValue: string) => {
    setSearch(searchValue)
    onSearchChange?.(searchValue)
  }, [onSearchChange])

  const handleSelect = (option: T) => {
    onSelect(option)
    setIsOpen(false)
    setSearch('')
    setTouched(true)
  }

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase()),
  )

  const isInvalid = required && touched && !value

  return (
    <>
      {label && (
        <Label className={cn(
          required && 'after:content-["*"] after:ml-1 after:text-red-500',
        )}
        >
          {label}
        </Label>
      )}
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              'w-full justify-between',
              disabled && 'opacity-50 cursor-not-allowed',
              isInvalid && 'border-red-500 focus:border-red-500',
              className,
            )}
            onBlur={() => setTouched(true)}
          >
            <span className="truncate">
              {value
                ? options.find(option => option.id === value)?.name
                : placeholder}
            </span>
            {isLoading
              ? <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              : <ChevronDown className="-mr-1 h-4 w-4 opacity-50" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-[300px] overflow-auto">
          <Command>
            <CommandInput
              placeholder="Rechercher..."
              value={search}
              onValueChange={handleSearchChange}
              className={inputClassName}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map(option => (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{option.name}</span>
                      <Check
                        className={cn(
                          value === option.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isInvalid && (
        <p className="text-sm text-red-500">
          This field is required
        </p>
      )}
    </>
  )
}
