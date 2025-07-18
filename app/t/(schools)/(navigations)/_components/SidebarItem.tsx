import type { ElementType } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  icon: ElementType
  label: string
  href: string
  ariaLabel?: string
  expanded: boolean
  currentPath: string
}

export function SidebarItem({
  icon: Icon,
  label,
  href,
  ariaLabel,
  expanded,
  currentPath,
}: SidebarItemProps) {
  return (
    <TooltipProvider key={href}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={cn(
                'flex items-center p-4 hover:bg-orange-100 cursor-pointer transition-colors duration-200',
                currentPath === href && 'bg-orange-100 hover:bg-orange-300 text-orange-600',
              )}
            >
              <Link
                href={href}
                className="flex items-center w-full"
                aria-label={ariaLabel}
                aria-current={currentPath === href ? 'page' : undefined}
              >
                <Icon className="h-6 w-6 text-orange-600" aria-hidden="true" />
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="ml-2 text-gray-700">{label}</span>
                  </motion.span>
                )}
              </Link>
            </div>
          </motion.div>
        </TooltipTrigger>
        {!expanded && (
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
