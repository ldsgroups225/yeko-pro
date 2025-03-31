'use client'

import type { FilterStudentWhereNotInTheClass } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

const badgeVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
}

const AnimatedBadge = motion.create(Badge)

interface SelectedStudentBadgeProps {
  student: FilterStudentWhereNotInTheClass
  onRemove: (studentId: string) => void
}

export function SelectedStudentBadge({ student, onRemove }: SelectedStudentBadgeProps) {
  return (
    <AnimatedBadge
      key={student.idNumber}
      variant="secondary"
      className="flex items-center gap-1"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={badgeVariants}
      layout
    >
      <Avatar className="h-4 w-4">
        <AvatarImage src={student.imageUrl || ''} />
        <AvatarFallback className="text-xs">
          {student.fullName.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      {student.fullName}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(student.idNumber)}
      >
        <X className="h-3 w-3 cursor-pointer" />
      </motion.button>
    </AnimatedBadge>
  )
}
