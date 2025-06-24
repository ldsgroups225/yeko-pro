'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function StudentPaymentsFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    }
    else {
      params.delete('search')
    }
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  const handleStatusFilter = (status: 'paid' | 'overdue' | 'all') => {
    const params = new URLSearchParams(searchParams)
    if (status === 'all') {
      params.delete('status')
    }
    else {
      params.set('status', status)
    }
    replace(`${pathname}?${params.toString()}`)
  }

  const currentStatus = searchParams.get('status')

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="font-bold tracking-tight dark:text-black/70">
          Status de paiement
        </h2>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={currentStatus === 'paid' ? 'default' : 'outline'}
            onClick={() => handleStatusFilter(currentStatus === 'paid' ? 'all' : 'paid')}
            className="dark:text-muted-foreground"
          >
            A jour
          </Button>
          <Button
            size="sm"
            variant={currentStatus === 'overdue' ? 'destructive' : 'outline'}
            onClick={() => handleStatusFilter(currentStatus === 'overdue' ? 'all' : 'overdue')}
            className="dark:text-muted-foreground"
          >
            En retard
          </Button>
        </div>
      </div>
      <div className="mt-4">
        <Input
          placeholder="Rechercher par nom ou matricule"
          defaultValue={searchParams.get('search')?.toString()}
          onChange={e => handleSearch(e.target.value)}
          className="dark:text-muted-foreground"
        />
      </div>
    </>
  )
}
