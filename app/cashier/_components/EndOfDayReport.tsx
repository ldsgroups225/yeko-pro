import {
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Printer,
  TrendingUp,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { Suspense } from 'react'
import { generateEndOfDayReport } from '@/app/cashier/actions/cashierServices'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

async function EndOfDayReportContent() {
  const reportData = await generateEndOfDayReport()

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30 bg-green-500/40 text-green-700 border-green-500/50'
      case 'mobile_money':
        return 'dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 bg-blue-500/40 text-blue-700 border-blue-500/50'
      case 'bank_transfer':
        return 'dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30 bg-purple-500/40 text-purple-700 border-purple-500/50'
      default:
        return 'dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30 bg-gray-500/40 text-gray-700 border-gray-500/50'
    }
  }

  const getMethodDisplayName = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'Espèces'
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank_transfer':
        return 'Virement'
      default:
        return method
    }
  }

  return (
    <Card
      className="border-border/30 shadow-glass bg-card/25 backdrop-blur-lg"
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-card-foreground text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Rapport de Fin de Journée
            </CardTitle>
            <CardDescription className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-background/20 border-border/30 text-foreground hover:bg-background/30 hover:text-foreground backdrop-blur-sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button
              size="sm"
              className="bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300 hover:bg-blue-500/30"
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Collections */}
            <div className="p-4 rounded-lg bg-card/20 border border-border/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Encaissé</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {formatCurrency(reportData.totalCollection)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
            </div>

            {/* Transaction Count */}
            <div className="p-4 rounded-lg bg-card/20 border border-border/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Transactions</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {reportData.transactionCount}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <CreditCard className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
            </div>

            {/* Average Transaction */}
            <div className="p-4 rounded-lg bg-card/20 border border-border/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Moy. Transaction</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {reportData.transactionCount > 0 ? formatCurrency(reportData.totalCollection / reportData.transactionCount) : formatCurrency(0)}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <TrendingUp className="h-6 w-6 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="p-4 rounded-lg bg-card/20 border border-border/20 backdrop-blur-sm">
            <h3 className="text-card-foreground font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Répartition par Mode de Paiement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.paymentMethodBreakdown.map(method => (
                <div key={nanoid()} className="flex items-center justify-between p-3 rounded-lg bg-background/15 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={getPaymentMethodColor(method.method)}
                    >
                      {getMethodDisplayName(method.method)}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      (
                      {method.count}
                      {' '}
                      trx)
                    </span>
                    <span className="text-card-foreground font-semibold">
                      {formatCurrency(method.amount, false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Completed Payments */}
          <div className="p-4 rounded-lg bg-card/20 border border-border/20 backdrop-blur-sm">
            <h3 className="text-card-foreground font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Transactions du Jour
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reportData.transactions.slice(0, 10).map(transaction => (
                <div key={nanoid()} className="flex items-center justify-between p-3 rounded-lg bg-background/15 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-800 dark:bg-green-400 rounded-full"></div>
                    <div>
                      <p className="text-card-foreground font-medium">{transaction.studentName}</p>
                      <p className="text-muted-foreground text-xs">{transaction.studentIdNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-card-foreground font-semibold">
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
          <div className="text-center pt-4 border-t border-border/10">
            <p className="text-muted-foreground text-sm">
              Rapport généré le
              {' '}
              {new Date().toLocaleString('fr-FR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EndOfDayReport() {
  return (
    <Suspense
      fallback={(
        <Card
          className="border-border/30 shadow-glass bg-card/25 backdrop-blur-lg"
          style={{
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-muted/30 border-t-primary rounded-full"></div>
              <span className="ml-3 text-card-foreground">Génération du rapport...</span>
            </div>
          </CardContent>
        </Card>
      )}
    >
      <EndOfDayReportContent />
    </Suspense>
  )
}
