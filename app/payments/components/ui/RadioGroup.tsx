'use client'

import type { InputHTMLAttributes } from 'react'
import type { FieldError } from 'react-hook-form'
import { forwardRef } from 'react'
import { FormField } from './FormField'

export interface RadioOption {
  label: string
  value: string
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'ref'> {
  label?: string
  options: RadioOption[]
  error?: FieldError
  inline?: boolean
  id?: string
}

export function RadioGroup({ ref, label, options, error, inline = false, className = '', id, ...props }: RadioGroupProps & { ref: React.RefObject<HTMLInputElement> }) {
  const baseInputStyles = `
      mr-2
      ${error
          ? 'border-red-300 text-red-600 focus:ring-red-500'
          : 'border-gray-300 text-blue-600 focus:ring-blue-500'
      }
    `

  return (
    <FormField
      label={label}
      error={error}
      id={id}
      className={className}
    >
      <div className={`${inline ? 'space-x-6' : 'space-y-2'}`}>
        {options.map(option => (
          <label
            key={option.value}
            className={`inline-flex items-center ${error ? 'text-red-900' : 'text-gray-700'}`}
          >
            <input
              type="radio"
              value={option.value}
              id={`${id}-${option.value}`}
              className={baseInputStyles}
              ref={ref}
              {...props}
            />
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </FormField>
  )
}

RadioGroup.displayName = 'RadioGroup'
