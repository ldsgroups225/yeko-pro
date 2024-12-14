import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ClassTableRowActions } from './ClassTableRowActions'

interface ClassesTableProps {
  classes: any[] | undefined // Replace 'any' with your actual Class type
}

/**
 * Component for displaying classes in a table view.
 *
 * @param {ClassesTableProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesTable: React.FC<ClassesTableProps> = ({ classes }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N°</TableHead>
          <TableHead>Nom de la classe</TableHead>
          <TableHead>Enseignant principal</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes?.map((cls, index) => (
          <TableRow key={cls._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{cls.name}</TableCell>
            <TableCell>Non assigné</TableCell>
            <TableCell className="flex justify-center">
              <Badge variant={cls.isActive ? 'outline' : 'destructive'}>
                {cls.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>
              <ClassTableRowActions />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
