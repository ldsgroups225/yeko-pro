'use client'

import { Loader2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface StudentPaymentsFiltersProps {
  isLoading?: boolean
}

export function StudentPaymentsFilters({ isLoading = false }: StudentPaymentsFiltersProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const [localFilterStatus, setLocalFilterStatus] = useState<'all' | 'paid' | 'overdue'>(() => {
    const status = searchParams.get('status')
    return (status as 'paid' | 'overdue') || 'all'
  })

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

  const handleChangeSearchParams = useDebouncedCallback((status: 'all' | 'paid' | 'overdue' | undefined) => {
    if (status) {
      handleStatusFilter(status)
    }
  }, 50)

  useEffect(() => {
    handleChangeSearchParams(localFilterStatus)
  }, [localFilterStatus, handleChangeSearchParams])
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="font-bold tracking-tight dark:text-black/70">
          Status de paiement
        </h2>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant={(localFilterStatus === 'all' || localFilterStatus === undefined) ? 'default' : 'outline'}
            onClick={() => setLocalFilterStatus('all')}
            className="dark:text-muted-foreground"
            disabled={isLoading}
          >
            {isLoading && localFilterStatus === 'all' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Tout
          </Button>

          {/* Vertical divider */}
          <div className="w-1 h-full bg-gray-600 dark:bg-gray-400" />

          <Button
            size="sm"
            variant={localFilterStatus === 'paid' ? 'default' : 'outline'}
            onClick={() => setLocalFilterStatus('paid')}
            className="dark:text-muted-foreground"
            disabled={isLoading}
          >
            {isLoading && localFilterStatus === 'paid' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            A jour
          </Button>
          <Button
            size="sm"
            variant={localFilterStatus === 'overdue' ? 'destructive' : 'outline'}
            onClick={() => setLocalFilterStatus('overdue')}
            className="dark:text-muted-foreground"
            disabled={isLoading}
          >
            {isLoading && localFilterStatus === 'overdue' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
