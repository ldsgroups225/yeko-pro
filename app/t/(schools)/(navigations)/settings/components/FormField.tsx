import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

interface FormFieldProps {
  label: string
  id: string
  defaultValue?: string
  placeholder?: string
  type?: string
  error?: string
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  defaultValue,
  placeholder,
  type = 'text',
  error,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

export default FormField
