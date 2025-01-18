'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface SaveButtonProps {
  count: number
  onClick: () => void
}

export function SaveButton({ count, onClick }: SaveButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Button className="w-full" onClick={onClick}>
        Ajouter
        {' '}
        {count}
        {' '}
        élève(s)
      </Button>
    </motion.div>
  )
}
