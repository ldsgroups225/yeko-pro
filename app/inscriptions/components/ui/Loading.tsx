'use client'

import { motion } from 'framer-motion'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  fullScreen?: boolean
}

export function Loading({ size = 'md', message, fullScreen = false }: LoadingProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className={`rounded-full border-t-2 border-b-2 border-blue-600 ${sizes[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-sm text-gray-600"
        >
          {message}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

interface LoadingOverlayProps {
  message?: string
  isLoading: boolean
}

export function LoadingOverlay({ message, isLoading }: LoadingOverlayProps) {
  if (!isLoading)
    return null

  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center rounded-lg">
      <Loading message={message} />
    </div>
  )
}
