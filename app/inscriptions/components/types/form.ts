// app/inscriptions/components/types/form.ts

import type { ReactNode } from 'react'
import type { FieldError } from 'react-hook-form'

export interface BaseFieldProps {
  label?: string
  error?: FieldError
  helperText?: string
  required?: boolean
}

export interface FormFieldProps extends BaseFieldProps {
  children: ReactNode
  className?: string
  id?: string
}

// Using RefCallback type since that's what react-hook-form uses
export type FormComponentRef = ((instance: HTMLInputElement | null) => void) | null

export interface BaseFormProps extends BaseFieldProps {
  ref?: FormComponentRef
  className?: string
  id?: string
  disabled?: boolean
}
