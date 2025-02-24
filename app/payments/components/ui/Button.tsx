'use client'

import type { HTMLMotionProps } from 'framer-motion'
import { motion } from 'framer-motion'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2'
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
  }
  const disabledStyles = 'opacity-50 cursor-not-allowed'

  return (
    <motion.button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled || isLoading ? disabledStyles : ''} ${className}`}
      whileHover={disabled || isLoading ? undefined : { scale: 1.02 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      {...props}
    >
      {isLoading
        ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Chargement...</span>
            </div>
          )
        : (
            children
          )}
    </motion.button>
  )
}
