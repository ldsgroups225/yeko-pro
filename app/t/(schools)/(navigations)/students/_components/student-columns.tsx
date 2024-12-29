import type { IStudentDTO } from '@/types'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<IStudentDTO>[] = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'idNumber',
    header: 'ID Number',
  },
]
