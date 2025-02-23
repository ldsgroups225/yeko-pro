'use client'

import type { HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  title?: string
  footer?: ReactNode
  description?: string
  children: ReactNode
}

export function Card({
  children,
  title,
  description,
  footer,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      {...props}
    >
      {/* Card Header */}
      {(title || description) && (
        <div className="p-6 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          {footer}
        </div>
      )}
    </motion.div>
  )
}

interface CardSubComponentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardSubComponentProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  )
}

interface CardSectionProps extends CardSubComponentProps {
  title: string
}

export function CardSection({
  title,
  children,
  className = '',
}: CardSectionProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-gray-700">{title}</h4>
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        {children}
      </div>
    </div>
  )
}

export function CardFooter({
  children,
  className = '',
}: CardSubComponentProps) {
  return (
    <div className={`mt-6 flex justify-between items-center ${className}`}>
      {children}
    </div>
  )
}
