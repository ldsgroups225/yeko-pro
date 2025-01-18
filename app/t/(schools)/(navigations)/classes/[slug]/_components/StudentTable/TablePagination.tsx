import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TablePaginationProps {
  total: number
  currentPage: number
  pagination: { hasNextPage: boolean, hasPreviousPage: boolean }
  onPageChange: (page: number) => void
}

export function TablePagination({ total, currentPage, pagination, onPageChange }: TablePaginationProps) {
  return (
    <CardFooter className="flex justify-between">
      <div className="text-sm text-muted-foreground">
        Affichage de
        {' '}
        {total}
        {' '}
        élèves sur
        {' '}
        {total}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  )
}
