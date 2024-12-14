import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClassTableRowActions } from './ClassTableRowActions'

interface ClassesGridProps {
  classes: any[] | undefined // Replace 'any' with your actual Class type
}

/**
 * Component for displaying classes in a grid view.
 *
 * @param {ClassesGridProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesGrid: React.FC<ClassesGridProps> = ({ classes }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {classes?.map((cls) => (
        <Card key={cls._id} className="p-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle>{cls.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Badge variant={cls.isActive ? 'outline' : 'destructive'}>
              {cls.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <p className="text-sm mt-2">PP: Non assigné</p>
            <div className="mt-2 flex space-x-2">
              <ClassTableRowActions />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
