import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { Edit, Eye, FileText, Mail, MoreHorizontal, UserMinus } from 'lucide-react'

export function StudentActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="h-4 w-4 mr-2" />
          Voir le profil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText className="h-4 w-4 mr-2" />
          Bulletin
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Mail className="h-4 w-4 mr-2" />
          Contacter parents
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <UserMinus className="h-4 w-4 mr-2" />
          Retirer de la classe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
