'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useMediaQuery, useSearchStudentsToAdd } from '@/hooks'
import { SaveButton } from './SaveButton'
import { SearchContent } from './SearchContent'

interface SearchStudentToAddProps {
  classId: string
  onClose: () => void
}

export function SearchStudentToAdd({ classId, onClose }: SearchStudentToAddProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const {
    search,
    setSearch,
    loading,
    students,
    selectedStudents,
    handleSelect,
    handleRemove,
    handleSave,
  } = useSearchStudentsToAdd({ classId })

  async function onSubmit() {
    try {
      const success = await handleSave()

      if (success) {
        setOpen(false)
        onClose()
      }
    }
    catch {

    }
  }

  const searchContentProps = {
    search,
    setSearch,
    loading,
    students,
    selectedStudents,
    onSelect: handleSelect,
    onRemove: handleRemove,
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-[250px] justify-start">
              + Ajouter un élève
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <SearchContent {...searchContentProps} />
            <AnimatePresence>
              {selectedStudents.length > 0 && (
                <SaveButton count={selectedStudents.length} onClick={onSubmit} />
              )}
            </AnimatePresence>
          </motion.div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" className="w-[250px] justify-start">
            + Ajouter un élève
          </Button>
        </motion.div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Ajouter des élèves</DrawerTitle>
        </DrawerHeader>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4"
        >
          <SearchContent {...searchContentProps} />
        </motion.div>
        <DrawerFooter>
          <AnimatePresence>
            {selectedStudents.length > 0 && (
              <SaveButton count={selectedStudents.length} onClick={handleSave} />
            )}
          </AnimatePresence>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
