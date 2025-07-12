import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
}

export function TablePagination({ currentPage, totalPages }: TablePaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages)
      return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <CardFooter className="flex justify-between">
      <div className="text-sm text-muted-foreground">
        Page
        {' '}
        {currentPage}
        {' '}
        sur
        {' '}
        {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  )
}
