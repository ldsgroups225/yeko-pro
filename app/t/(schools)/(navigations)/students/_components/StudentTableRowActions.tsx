import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon, Link1Icon, Pencil1Icon, PersonIcon } from '@radix-ui/react-icons'

interface StudentTableRowActionsProps {
  editButtonClicked: () => void
  navigateToStudent: () => void
  linkToParent: () => void
}

export function StudentTableRowActions({
  editButtonClicked,
  navigateToStudent,
  linkToParent,
}: StudentTableRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem onClick={navigateToStudent}>
          <PersonIcon className="mr-2 h-4 w-4" />
          Voir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={editButtonClicked}>
          <Pencil1Icon className="mr-2 h-4 w-4" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={linkToParent}>
          <Link1Icon className="mr-2 h-4 w-4" />
          Lier à son parent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
