import { Button } from '@/components/ui/button'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Component for pagination controls.
 *
 * @param {PaginationProps} props - The component props.
 * @returns {JSX.Element} The rendered component.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const maxVisiblePages = 5
  const startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2),
  )
  const endPage = Math.min(
    totalPages,
    startPage + maxVisiblePages - 1,
  )

  const pages = []
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        <ChevronLeftIcon width={16} height={16} />
      </Button>

      {startPage > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(1)}
            aria-label="Go to Page 1"
          >
            1
          </Button>
          {startPage > 2 && <span className="mx-1">...</span>}
        </>
      )}

      {pages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'ghost'}
          size="icon"
          onClick={() => onPageChange(page)}
          aria-label={`Go to Page ${page}`}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="mx-1">...</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to Page ${totalPages}`}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        <ChevronRightIcon width={16} height={16} />
      </Button>
    </div>
  )
}
