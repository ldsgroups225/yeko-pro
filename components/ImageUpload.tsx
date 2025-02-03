'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserCircle } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface ImageUploadProps {
  disabled?: boolean
  value?: string | null
  label?: string
  onChange: (url: string | null) => void
}

const MAX_FILE_SIZE = 3 * 1024 * 1024 // 3MB in bytes

export function ImageUpload({ value, onChange, disabled, label = 'avatar' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file)
      return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('L\'image ne doit pas dépasser 3MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      onChange(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-24 w-24">
        {preview
          ? (
              <Image
                src={preview}
                alt={`${label} preview`}
                fill
                className="rounded-full object-cover"
              />
            )
          : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                <UserCircle className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Changer l&apos;
          {' '}
          {label}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            disabled={disabled}
          >
            Supprimer
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Format accepté: JPG, PNG, GIF (max 3MB)
      </p>
    </div>
  )
}
