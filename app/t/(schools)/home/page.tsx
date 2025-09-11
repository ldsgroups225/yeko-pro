'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useUserContext } from '@/hooks'
import { CurrentTime, QuickAccess, SchoolInfo } from './_components'

/**
 * The main home page component.
 */
const HomePage: React.FC = () => {
  const { user, isLoading } = useUserContext()

  const formattedSchool = {
    name: user?.school?.name ?? '',
    imageUrl: user?.school?.imageUrl ?? '',
    classCount: user?.school?.classCount ?? 0,
    effective: user?.school?.studentCount ?? 0,
  }

  return (
    <main className="flex-grow flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-6xl flex flex-col md:flex-row justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <QuickAccess isLoading={isLoading} />
        <div className="w-full md:w-2/5 md:pl-6 flex flex-col justify-between">
          <SchoolInfo school={formattedSchool} isLoading={isLoading} />
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Image
                src="/logo.png"
                alt="Logo Yeko"
                width={256}
                height={256}
                className="h-64 w-64 object-contain rounded-md"
                priority
              />
            </motion.div>
            <CurrentTime />
          </div>
        </div>
      </motion.div>
    </main>
  )
}

export default HomePage
