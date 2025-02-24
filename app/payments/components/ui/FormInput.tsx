'use client'

import type { InputHTMLAttributes, RefCallback } from 'react'
import type { FieldError } from 'react-hook-form'
import { FormField, InputWrapper } from './FormField'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: FieldError
  helperText?: string
  icon?: React.ReactNode
  // Allow either RefObject or RefCallback for ref
  ref?: RefCallback<HTMLInputElement>
}

// Note: We use React.Ref type which accepts both RefObject and RefCallback
export function FormInput({ ref, ...props }: Omit<FormInputProps, 'ref'> & { ref: React.RefObject<HTMLInputElement> }) {
  const { label, error, helperText, icon, className = '', id, ...rest } = props

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
          ref={ref}
          id={id}
          className={baseStyles}
          aria-invalid={error ? 'true' : 'false'}
          {...rest}
        />
      </InputWrapper>
    </FormField>
  )
}

FormInput.displayName = 'FormInput'
