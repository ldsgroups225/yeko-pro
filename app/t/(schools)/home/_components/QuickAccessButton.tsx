import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { Card } from '@/components/ui/card'

interface QuickAccessButtonProps {
  icon: React.ReactNode
  disabled?: boolean
  label: string
  href: string
}

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({ icon, label, href, disabled = true }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Link href={disabled ? '#' : href}>
      <Card className="flex flex-col items-center justify-center p-4 hover:bg-orange-50 transition-colors cursor-pointer shadow-md bg-white h-full">
        <div className="text-orange-600 mb-2">{icon}</div>
        <span className="text-md text-muted-foreground text-center">{label}</span>
      </Card>
    </Link>
  </motion.div>
)

export default QuickAccessButton
