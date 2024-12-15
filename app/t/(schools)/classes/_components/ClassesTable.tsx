import type { DataModel } from '@/convex/_generated/dataModel'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ClassTableRowActions } from './ClassTableRowActions'

type IClass = DataModel['classes']['document']

interface ClassesTableProps {
  classes?: IClass[]
  isLoading: boolean
}

/**
 * Component for displaying classes in a table view.
 *
 * @param {ClassesTableProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const ClassesTable: React.FC<ClassesTableProps> = ({
  classes,
  isLoading,
}) => {
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
        {isLoading
          ? (
              <>
                {Array.from({ length: 10 }).map((el: any) => (
                  <TableRow key={el?.toString()}>
                    <TableCell>
                      <Skeleton className="h-4 w-[20px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell className="flex justify-center">
                      <Skeleton className="h-7 w-[80px] rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-7 w-[100px] rounded-md" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )
          : (
              classes?.map((cls, index) => (
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
              ))
            )}
      </TableBody>
    </Table>
  )
}
