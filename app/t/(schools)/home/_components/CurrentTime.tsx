import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * Displays the current time, refreshed every minute.
 */
export const CurrentTime: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  )

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      )
    }, 60000) // Update every 60 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-2xl font-bold w-[140px] flex items-center justify-center p-4 mx-auto mt-4"
    >
      {currentTime}
    </motion.div>
  )
}
