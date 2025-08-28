'use client'

import type { InputHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'
import { FormField, InputWrapper } from './FormField'

interface ControlledInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'ref'> {
  label?: string
  error?: FieldError
  helperText?: string
  icon?: React.ReactNode
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function ControlledInput({
  label,
  error,
  helperText,
  icon,
  className = '',
  id,
  value,
  onChange,
  ...props
}: ControlledInputProps) {
  const baseStyles = [
    'block w-full rounded-md border shadow-sm',
    error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    icon ? 'pl-10' : '',
    className,
  ].join(' ')

  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      id={id}
    >
      <InputWrapper error={!!error} icon={icon}>
        <input
          id={id}
          value={value}
          onChange={onChange}
          className={baseStyles}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      </InputWrapper>
    </FormField>
  )
}
