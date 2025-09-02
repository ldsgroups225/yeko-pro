'use client'

import { Calendar, CheckCircle, CreditCard, Download, FileText, Printer, TrendingUp } from 'lucide-react'
import { nanoid } from 'nanoid'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data for demonstration
const MOCK_REPORT_DATA = {
  date: new Date(),
  totalCollection: 1250000,
  transactionCount: 45,
  paymentMethodBreakdown: [
    { method: 'Espèces', count: 20, amount: 500000 },
    { method: 'Mobile Money', count: 15, amount: 450000 },
    { method: 'Virement', count: 10, amount: 300000 },
  ],
  transactions: [
    { studentName: 'Marie Kouadio', studentIdNumber: '2024001', amount: 50000, paidAt: new Date() },
    { studentName: 'Jean Dupont', studentIdNumber: '2024002', amount: 75000, paidAt: new Date() },
    { studentName: 'Sophie Martin', studentIdNumber: '2024003', amount: 60000, paidAt: new Date() },
  ],
  cashierName: 'Marie Kouadio',
}

export function ReportModal({ open, onOpenChange }: ReportModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData] = useState(MOCK_REPORT_DATA)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // TODO: Implement actual report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Report generated successfully
    }
    catch {
      // Handle error silently for now
    }
    finally {
      setIsGenerating(false)
    }
  }

  const handlePrint = () => {
    // TODO: Implement print functionality
    window.print()
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    // Exporting report...
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'espèces':
      case 'cash':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'mobile money':
      case 'mobile_money':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'virement':
      case 'transfer':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapport de Fin de Journée
          </DialogTitle>
          <DialogDescription>
            Générer et consulter le rapport détaillé des transactions du jour
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Header */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                {reportData.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                disabled={isGenerating}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Encaissé</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(reportData.totalCollection)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Transactions</p>
                  <p className="text-2xl font-bold">
                    {reportData.transactionCount}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Moy. Transaction</p>
                  <p className="text-2xl font-bold">
                    {reportData.transactionCount > 0
                      ? formatCurrency(reportData.totalCollection / reportData.transactionCount)
                      : formatCurrency(0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Répartition par Mode de Paiement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.paymentMethodBreakdown.map(method => (
                <div key={nanoid()} className="flex items-center justify-between p-3 rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={getPaymentMethodColor(method.method)}
                    >
                      {method.method}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      (
                      {method.count}
                      {' '}
                      transactions)
                    </span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(method.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Transactions du Jour
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reportData.transactions.slice(0, 10).map(transaction => (
                <div key={nanoid()} className="flex items-center justify-between p-3 rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div>
                      <p className="font-medium">{transaction.studentName}</p>
                      <p className="text-muted-foreground text-xs">{transaction.studentIdNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {transaction.paidAt.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-muted-foreground text-sm">
              Rapport généré le
              {' '}
              {new Date().toLocaleString('fr-FR')}
              {' '}
              par
              {' '}
              {reportData.cashierName}
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              size="lg"
            >
              {isGenerating
                ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Génération en cours...
                    </>
                  )
                : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer le Rapport
                    </>
                  )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
