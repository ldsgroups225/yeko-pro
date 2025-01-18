import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Download, Edit, MoreHorizontal, Trash, Upload } from 'lucide-react'

export function ClassActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Que voulez-vous faire ?</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Edit className="h-4 w-4 mr-2" />
          Modifier la classe
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Upload className="h-4 w-4 mr-2" />
          Importer des élèves
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Download className="h-4 w-4 mr-2" />
          Exporter les données
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash className="h-4 w-4 mr-2" />
          Supprimer la classe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
