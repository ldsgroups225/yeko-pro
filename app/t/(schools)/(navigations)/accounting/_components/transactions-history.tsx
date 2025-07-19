'use client'
import type { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { CalendarIcon, DownloadCloudIcon, Loader2, Printer, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from 'use-debounce'
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
  const [downloadAllPaymentHistory, setDownloadAllPaymentHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPrinting, setIsPrinting] = useState('')

  const [searchMatricule, setSearchMatricule] = useState('')
  const [debouncedSearch] = useDebounce(searchMatricule, 500)
  const [filterDate, setFilterDate] = useState<DateRange | undefined>(undefined)

  useEffect(() => {
    if (!isHistoricOpen)
      return

    const fetchTransactions = async () => {
      setIsLoading(true)
      try {
        const fetchedTransactions = await getPaymentHistory({
          searchTerm: debouncedSearch,
          startDate: filterDate?.from?.toISOString(),
          endDate: filterDate?.to?.toISOString(),
        })
        setTransactions(fetchedTransactions)
      }
      catch (error) {
        toast.error('Échec de la récupération des transactions.')
        console.error(error)
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [isHistoricOpen, debouncedSearch, filterDate])

  const handlePrintReceipt = async (studentIdNumber: string, id: string) => {
    try {
      setIsPrinting(id)
      const receipt = await fetch(`/t/accounting/${studentIdNumber}/receipt`)

      // download the receipt
      const blob = await receipt.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt_${studentIdNumber}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    }
    catch (error) {
      toast.error((error as Error).message)
    }
    finally {
      setIsPrinting('')
    }
  }

  const handleDownloadAllPaymentHistory = async () => {
    setDownloadAllPaymentHistory(true)
    try {
      // Get complete payment history with all details
      const client = await import('@/lib/supabase/client').then(m => m.createClient())

      const { data: paymentHistory, error } = await client
        .from('payment_details_view')
        .select(`
          first_name, last_name, id_number,
          payment_date, payment_amount, payment_method,
          remaining_amount, total_amount
        `)
        .order('payment_date', { ascending: false })

      if (error) {
        throw new Error('Erreur lors de la récupération des données')
      }

      // Transform data for Excel with proper French column headers
      const excelData = paymentHistory.map(payment => ({
        'Élève': `${payment.first_name || ''} ${payment.last_name || ''}`.trim(),
        'Matricule': payment.id_number || '',
        'Date de paiement': payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('fr-FR') : '',
        'Montant payé': payment.payment_amount || 0,
        'Méthode de paiement': payment.payment_method || '',
        'Montant total': payment.total_amount || 0,
        'Reste à payer': payment.remaining_amount || 0,
      }))

      // Create Excel file
      const XLSX = await import('xlsx')
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Set column widths for better readability
      const colWidths = [
        { wch: 25 }, // Élève
        { wch: 15 }, // Matricule
        { wch: 15 }, // Date de paiement
        { wch: 15 }, // Montant payé
        { wch: 20 }, // Méthode de paiement
        { wch: 15 }, // Montant total
        { wch: 15 }, // Reste à payer
      ]
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historique des paiements')

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0]
      const filename = `historique_de_paiement_${currentDate}.xlsx`

      XLSX.writeFile(workbook, filename)
      toast.success('Téléchargement de l\'historique complet de paiement réussi.')
    }
    catch (error) {
      console.error('Download error:', error)
      toast.error('Échec du téléchargement de l\'historique complet de paiement.')
    }
    finally {
      setDownloadAllPaymentHistory(false)
    }
  }

  const clearFilters = () => {
    setSearchMatricule('')
    setFilterDate(undefined)
  }

  return (
    <Sheet open={isHistoricOpen} onOpenChange={setHistoricTransactionsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-[720px]">
        <SheetHeader>
          <SheetTitle className="flex gap-x-10 mb-2">
            Historique de paiements

            <Button
              size="sm"
              variant="ghost"
              disabled={downloadAllPaymentHistory}
              onClick={handleDownloadAllPaymentHistory}
            >
              <DownloadCloudIcon className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </SheetTitle>

        </SheetHeader>

        <div className="flex space-x-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher par nom ou matricule"
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
                {filterDate?.from
                  ? (
                      filterDate.to
                        ? (
                            <>
                              {format(filterDate.from, 'LLL dd, y')}
                              {' '}
                              -
                              {' '}
                              {format(filterDate.to, 'LLL dd, y')}
                            </>
                          )
                        : (
                            format(filterDate.from, 'LLL dd, y')
                          )
                    )
                  : (
                      <span>Filtrer par date</span>
                    )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filterDate?.from}
                selected={filterDate}
                onSelect={setFilterDate}
                numberOfMonths={2}
              />
              {filterDate && (
                <div className="p-2 border-t flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setFilterDate(undefined)}
                  >
                    Effacer la sélection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="rounded-md border">
          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          )}
          {!isLoading && (
            <div className="px-2">
              <p className="text-sm text-muted-foreground mb-4">
                Affichage des
                {' '}
                {transactions.length}
                {' '}
                derniers résultats
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
                          onClick={() => handlePrintReceipt(transaction.matriculation, transaction.id)}
                        >
                          {
                            isPrinting === transaction.id
                              ? (
                                  <Loader2 className="animate-spin" />
                                )
                              : (
                                  <Printer className="h-4 w-4" />
                                )
                          }
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
