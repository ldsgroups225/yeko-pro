'use client'

import type { HTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'

interface FormFieldWrapperProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: FieldError
  helperText?: string
  required?: boolean
}

export function FormField({
  label,
  error,
  helperText,
  required,
  children,
  className = '',
  id,
  ...props
}: FormFieldWrapperProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {(error || helperText) && (
        <p
          className={`mt-1 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error?.message || helperText}
        </p>
      )}
    </div>
  )
}

interface InputWrapperProps extends HTMLAttributes<HTMLDivElement> {
  error?: boolean
  icon?: React.ReactNode
}

export function InputWrapper({
  children,
  error,
  icon,
  className = '',
  ...props
}: InputWrapperProps) {
  return (
    <div
      className={`relative rounded-md shadow-sm ${className}`}
      {...props}
    >
      {icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
      )}
      {children}
    </div>
  )
}
