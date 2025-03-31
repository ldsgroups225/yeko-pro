'use client'

import type { Student } from '../../types'
import { Badge } from '@/components/ui/badge'
import { UserCircle } from 'lucide-react'
import Image from 'next/image'

interface StudentAvatarProps {
  student: Student
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: {
    container: 'h-16 w-16',
    icon: 'h-12 w-12',
    image: 120,
  },
  md: {
    container: 'h-20 w-20',
    icon: 'h-16 w-16',
    image: 170,
  },
  lg: {
    container: 'h-24 w-24',
    icon: 'h-20 w-20',
    image: 200,
  },
}

export function StudentAvatar({ student, className = '', size = 'md' }: StudentAvatarProps) {
  const sizeConfig = SIZES[size]

  return (
    <div className={`relative ${className}`}>
      {student.avatarUrl
        ? (
            <Image
              src={student.avatarUrl}
              alt={`${student.firstName} ${student.lastName}`}
              className="rounded-3xl object-cover"
              width={sizeConfig.image}
              height={sizeConfig.image}
              priority
            />
          )
        : (
            <div className={`${sizeConfig.container} rounded-full bg-muted flex items-center justify-center`}>
              <UserCircle className={`${sizeConfig.icon} text-muted-foreground`} />
            </div>
          )}
      <Badge
        className="absolute -bottom-2 right-0"
        variant="secondary"
      >
        {student.gender === 'M' ? 'Masculin' : 'Féminin'}
      </Badge>
    </div>
  )
}
