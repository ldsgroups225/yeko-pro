'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmationText: string
  onConfirm: () => void
  isLoading?: boolean
  loadingText?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmationText,
  onConfirm,
  isLoading = false,
  loadingText = 'Suppression...',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'destructive',
}: ConfirmationDialogProps) {
  const [inputText, setInputText] = useState('')

  useEffect(() => {
    if (!open) {
      setInputText('')
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen)
    }
  }

  const handleConfirm = () => {
    onConfirm()
    setInputText('')
  }

  const isConfirmDisabled = inputText !== confirmationText || isLoading

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className={variant === 'destructive' ? 'text-destructive' : ''}>
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
            <span className="select-none font-medium">
              {' '}
              {confirmationText}
            </span>
            {' '}
            ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="my-4"
          disabled={isLoading}
          placeholder="Tapez le texte de confirmation..."
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isLoading ? loadingText : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
