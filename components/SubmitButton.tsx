'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { UpdateIcon } from '@radix-ui/react-icons'
import { useFormStatus } from 'react-dom'

interface Props {
  label?: string
  className?: string
  disabled?: boolean
}

export function SubmitButton({ label = 'Envoyer', className = '', disabled = false }: Props) {
  const { pending } = useFormStatus()

  return (
    <Button
      disabled={pending || disabled}
      type="submit"
      className={cn(
        'w-full transition-colors duration-300 ease-in-out',
        className,
      )}
    >
      {(pending || disabled) && (
        <UpdateIcon className="mr-2 h-4 w-4 animate-spin" />
      )}
      {label}
    </Button>
  )
}
