import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  editButtonClicked: () => void
  navigateToClass: () => void
}

/**
 * Component for displaying the actions of a class table row.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const ClassTableRowActions: React.FC<Props> = ({ editButtonClicked, navigateToClass }) => {
  return (
    <div className="flex space-x-2 justify-center">
      <Button variant="outline" size="sm" onClick={editButtonClicked}>
        Modifier
      </Button>
      <Button variant="outline" size="sm" onClick={navigateToClass}>
        Voir
      </Button>
    </div>
  )
}
