import { Button } from '@/components/ui/button'

/**
 * Component for displaying the actions of a class table row.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const ClassTableRowActions: React.FC = () => {
  return (
    <div className="flex space-x-2 justify-center">
      <Button variant="outline" size="sm">
        Modifier
      </Button>
      <Button variant="outline" size="sm">
        Voir
      </Button>
    </div>
  )
}
