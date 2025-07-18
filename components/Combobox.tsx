import { Check, ChevronDown, Loader2 } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
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
import { cn, removeAccents } from '@/lib/utils'

interface ComboboxProps<T extends { id: string, name: string }> {
  value?: string
  options: T[]
  onSelect: (option: T) => void
  label?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  isLoading?: boolean
  searchFrom?: 'name' | 'id' | 'both'
  onSearchChange?: (search: string) => void
  className?: string
  inputClassName?: string
  disabled?: boolean
  required?: boolean
  debounceDelay?: number
}

export function Combobox({
  value,
  options,
  onSelect,
  label,
  placeholder = 'Sélectionnez une option',
  searchPlaceholder = 'Rechercher...',
  emptyText = 'Aucun résultat trouvé',
  searchFrom = 'both',
  isLoading = false,
  onSearchChange,
  className,
  inputClassName,
  disabled = false,
  required = false,
  debounceDelay = 300,
}: ComboboxProps<{ id: string, name: string }>) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [debouncedSearchTerm] = useDebounceValue(inputValue, debounceDelay)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    onSearchChange?.(debouncedSearchTerm)
  }, [debouncedSearchTerm, onSearchChange])

  const handleSelect = (option: { id: string, name: string }) => {
    onSelect(option)
    setIsOpen(false)
    setInputValue('')
    setTouched(true)
  }

  const filteredOptions = useMemo(() => {
    const searchTermLower = removeAccents(debouncedSearchTerm.toLowerCase())

    if (!searchTermLower) {
      return options
    }

    return options.filter((option) => {
      const nameLower = removeAccents(option.name.toLowerCase())
      const idLower = removeAccents(option.id.toLowerCase())

      switch (searchFrom) {
        case 'name':
          return nameLower.includes(searchTermLower)
        case 'id':
          return idLower.includes(searchTermLower)
        case 'both':
        default:
          return (
            nameLower.includes(searchTermLower)
            || idLower.includes(searchTermLower)
          )
      }
    })
  }, [options, debouncedSearchTerm, searchFrom])

  const isInvalid = required && touched && !value

  const displayValue = useMemo(() => {
    return options.find(option => option.id === value)?.name
  }, [options, value])

  // Clear search when closing the popover if nothing is selected
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setInputValue('')
    }
  }
  return (
    <div className="w-full">
      {label && (
        <Label
          htmlFor={label}
          className={cn(
            'block text-sm font-medium text-gray-700 mb-1',
            required && 'after:content-["*"] after:ml-0.5 after:text-red-500',
          )}
        >
          {label}
        </Label>
      )}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={label}
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            disabled={disabled}
            className={cn(
              'w-full justify-between text-left font-normal',
              !displayValue && 'text-muted-foreground',
              disabled && 'opacity-50 cursor-not-allowed',
              isInvalid && 'border-red-500 focus:ring-red-500',
              className,
            )}
            onBlur={() => {
              if (!value) {
                setTouched(true)
              }
            }}
          >
            <span className="truncate">
              {displayValue ?? placeholder}
            </span>
            {isLoading
              ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />
                )
              : (
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0 max-h-[300px] overflow-auto"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={inputValue}
              onValueChange={setInputValue}
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
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.id ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{option.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isInvalid && (
        <p className="mt-1 text-sm text-red-500">
          This field is required
        </p>
      )}
    </div>
  )
}
