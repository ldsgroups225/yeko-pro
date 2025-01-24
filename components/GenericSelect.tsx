import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'

interface GenericSelectProps<T extends { id: string, name: string }> {
  label?: string
  value: string
  options: T[]
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
}

export function GenericSelect<T extends { id: string, name: string }>({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Sélectionnez une option',
  required = false,
  disabled = false,
}: GenericSelectProps<T>) {
  return (
    <>
      {label && <Label>{label}</Label>}
      <Select
        value={value}
        onValueChange={onValueChange}
        required={required}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.id} value={option.id}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
