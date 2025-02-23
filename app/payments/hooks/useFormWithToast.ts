'use client'

import type { FieldValues, SubmitHandler, UseFormProps, UseFormReturn } from 'react-hook-form'
import { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface UseFormWithToastOptions<T extends FieldValues> extends UseFormProps<T> {
  onError?: (error: Error) => void
}

interface UseFormWithToastReturn<T extends FieldValues> extends Omit<UseFormReturn<T>, 'handleSubmit'> {
  isSubmitting: boolean
  handleError: (error: unknown) => void
  handleSubmitWithToast: (onValid: SubmitHandler<T>) => (e?: React.BaseSyntheticEvent) => Promise<void>
}

export function useFormWithToast<T extends FieldValues>(
  options?: UseFormWithToastOptions<T>,
): UseFormWithToastReturn<T> {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const methods = useForm<T>(options)

  const handleError = useCallback((error: unknown) => {
    setIsSubmitting(false)
    const message = error instanceof Error ? error.message : 'Une erreur est survenue'
    console.error('Form error:', error)
    toast.error(message)
    options?.onError?.(error instanceof Error ? error : new Error(message))
  }, [options])

  const handleSubmitWithToast = useCallback((onValid: SubmitHandler<T>) => {
    return methods.handleSubmit(async (data) => {
      setIsSubmitting(true)
      try {
        await onValid(data)
      }
      catch (error) {
        handleError(error)
      }
      finally {
        setIsSubmitting(false)
      }
    })
  }, [methods.handleSubmit, handleError])

  return {
    ...methods,
    isSubmitting,
    handleError,
    handleSubmitWithToast,
  }
}
