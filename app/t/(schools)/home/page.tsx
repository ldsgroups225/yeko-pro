'use client';

import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CurrentTime, QuickAccess, SchoolInfo } from './_components'


/**
 * The main home page component.
 */
const HomePage: React.FC = () => {
  const school = useQuery(api.schools.getStaffSchool, {})
  const isLoading = school === undefined

  
  const formattedSchool = {
    name: school?.name ?? '',
    imageUrl: school?.imageUrl ?? '',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shadow-sm sticky top-0 z-10">
        <div className="bg-primary h-3"></div>
        <div className="bg-blue-600 h-9 mx-12 rounded-b-lg"></div>
      </header>
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
              <motion.img
                src="/logo.png"
                alt="Logo Yeko"
                className="h-64 w-64 object-contain rounded-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              />
              <CurrentTime />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
