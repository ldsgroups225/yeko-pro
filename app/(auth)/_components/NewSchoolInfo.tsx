'use client'

import { Button } from '@/components/ui/button'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import React, { useState } from 'react'

/**
 * NewSchoolInfo component that displays information about creating a new school account.
 * @returns {JSX.Element} The rendered NewSchoolInfo component
 */
export const NewSchoolInfo: React.FC = () => {
  const [showNewSchoolInfo, setShowNewSchoolInfo] = useState(false)

  return (
    <div className="w-full">
      <Button
        variant="link"
        onClick={() => setShowNewSchoolInfo(!showNewSchoolInfo)}
        className="w-full"
      >
        Créer un nouveau compte d'école
        {showNewSchoolInfo ? <ChevronUpIcon className="ml-2 h-4 w-4" /> : <ChevronDownIcon className="ml-2 h-4 w-4" />}
      </Button>
      {showNewSchoolInfo && (
        <div className="mt-4 text-sm text-muted-foreground bg-muted p-4 rounded-lg">
          <p>Pour créer un nouveau compte d'école, veuillez contacter notre équipe commerciale :</p>
          <p className="mt-2">
            Email :
            {' '}
            <a href="mailto:contact@yekoadmin.com" className="text-primary hover:underline">contact@yekoadmin.com</a>
          </p>
          <p>Téléphone : +225 07 0707 0707</p>
        </div>
      )}
    </div>
  )
}
