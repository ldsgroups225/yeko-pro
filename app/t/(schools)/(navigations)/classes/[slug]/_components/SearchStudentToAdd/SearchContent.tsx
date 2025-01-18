'use client'

import type { FilterStudentWhereNotInTheClass } from '@/types'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandList,
} from '@/components/ui/command'
import { AnimatePresence, motion } from 'framer-motion'
import * as React from 'react'
import { memo, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { SelectedStudentBadge } from './SelectedStudentBadge'
import { StudentCommandItem } from './StudentCommandItem'

const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
    },
  }),
  exit: { opacity: 0, x: -20 },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

interface SearchContentProps {
  search: string
  setSearch: (search: string) => void
  loading: boolean
  students: FilterStudentWhereNotInTheClass[]
  selectedStudents: FilterStudentWhereNotInTheClass[]
  onSelect: (student: FilterStudentWhereNotInTheClass) => void
  onRemove: (studentId: string) => void
}

export const SearchContent = memo(({
  search,
  setSearch,
  loading,
  students,
  selectedStudents,
  onSelect,
  onRemove,
}: SearchContentProps) => {
  const [localSearch, setLocalSearch] = useState(search)
  const [debouncedLocalSearch] = useDebounce(localSearch, 300)

  useEffect(() => {
    setSearch(debouncedLocalSearch)
  }, [debouncedLocalSearch, setSearch])

  useEffect(() => {
    if (search === '') {
      setLocalSearch('')
    }
  }, [search])

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence>
        {selectedStudents.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-2 border rounded-lg">
              <AnimatePresence>
                {selectedStudents.map(student => (
                  <SelectedStudentBadge key={student.idNumber} student={student} onRemove={onRemove} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Rechercher un élève..."
          value={localSearch}
          onValueChange={setLocalSearch}
        />
        <CommandList>
          <AnimatePresence mode="wait">
            {loading
              ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 text-center"
                  >
                    Chargement...
                  </motion.div>
                )
              : students.length === 0
                ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 text-center"
                    >
                      Aucun élève trouvé.
                    </motion.div>
                  )
                : (
                    <CommandGroup>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {students.map((student, index) => (
                          <motion.div
                            key={student.idNumber}
                            variants={listItemVariants}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            layout
                          >
                            <StudentCommandItem
                              student={student}
                              onSelect={onSelect}
                              disabled={selectedStudents.some(s => s.idNumber === student.idNumber)}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </CommandGroup>
                  )}
          </AnimatePresence>
        </CommandList>
      </Command>
    </div>
  )
})
