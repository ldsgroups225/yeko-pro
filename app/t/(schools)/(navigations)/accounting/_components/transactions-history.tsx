'use client'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { getPaymentHistory } from '@/services/paymentService'
import { useTransactionsStore } from '@/store/transactionStore'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Printer, Search, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

interface Transaction {
  id: string
  studentName: string
  matriculation: string
  paymentDate: Date
  amount: number
}

export function TransactionsHistory() {
  const { isHistoricOpen, setHistoricTransactionsOpen } = useTransactionsStore()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [searchMatricule, setSearchMatricule] = useState('')
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)

  const fetchTransactions = async () => {
    if (!isHistoricOpen)
      return

    setIsLoading(true)
    const fetchedTransactions = await getPaymentHistory()

    setTransactions(fetchedTransactions)
    setIsLoading(false)
  }

  useEffect(() => {
    if (!isHistoricOpen)
      return

    fetchTransactions()
  }, [isHistoricOpen])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesMatricule = searchMatricule
        ? transaction.matriculation
            .toLowerCase()
            .includes(searchMatricule.toLowerCase())
        : true

      const matchesDate = !filterDate
        || (transaction.paymentDate
          && transaction.paymentDate.toDateString() === filterDate.toDateString())

      return matchesMatricule && matchesDate
    }).slice(0, 10)
  }, [transactions, searchMatricule, filterDate])

  const handlePrintReceipt = async (_transactionId: string) => {
    // TODO: Implement receipt printing logic
  }

  const clearFilters = () => {
    setSearchMatricule('')
    setFilterDate(undefined)
  }

  return (
    <Sheet open={isHistoricOpen} onOpenChange={setHistoricTransactionsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle>Historique de paiements</SheetTitle>
        </SheetHeader>

        <div className="flex space-x-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher par matricule"
              value={searchMatricule}
              onChange={e => setSearchMatricule(e.target.value)}
              className="pl-8"
            />
            {(searchMatricule || filterDate) && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !filterDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? format(filterDate, 'PPP') : <span>Filtrer par date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="rounded-md border">
          {isLoading && (
            <div className="flex items-center justify-center h-8">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {!isLoading && (
            <div className="px-2">
              <p className="text-sm text-muted-foreground mb-4">
                Affichage de
                {' '}
                {filteredTransactions.length}
                {' '}
                transactions sur
                {' '}
                {transactions.length}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Montant payé</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.studentName}
                      </TableCell>
                      <TableCell>{transaction.matriculation}</TableCell>
                      <TableCell>
                        {formatDate(transaction.paymentDate)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrintReceipt(transaction.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
