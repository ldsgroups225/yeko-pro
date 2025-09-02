import { Clock, DollarSign } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTimePassed } from '@/lib/utils'
import { getRecentTransactions } from '../actions/cashierServices'

export async function RecentTransactions() {
  const transactions = await getRecentTransactions(8)

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30 bg-green-500/40 text-green-700 border-green-500/50'
      case 'mobile_money':
        return 'dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 bg-blue-500/40 text-blue-700 border-blue-500/50'
      case 'bank_transfer':
        return 'dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30 bg-orange-500/40 text-orange-700 border-orange-500/50'
      default:
        return 'dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30 bg-gray-500/40 text-gray-700 border-gray-500/50'
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'Espèces'
      case 'mobile_money':
        return 'Mobile Money'
      case 'bank_transfer':
        return 'Virement'
      default:
        return 'Autre'
    }
  }

  const getStudentInitials = (name: string) => {
    const parts = name.split(' ')
    return parts.length >= 2
      ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
      : name.charAt(0).toUpperCase()
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
            <CardTitle className="text-lg text-card-foreground">Transactions Récentes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Dernières opérations de paiement
            </CardDescription>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 backdrop-blur-sm">
            <Clock className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0
          ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune transaction aujourd'hui</p>
              </div>
            )
          : (
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-card/15 backdrop-blur-sm hover:bg-card/25 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Student Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                          {getStudentInitials(transaction.studentName)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Transaction Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-sm text-card-foreground">
                            {transaction.studentName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {transaction.studentIdNumber}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimePassed(transaction.paidAt)}
                          </span>
                          {transaction.className && (
                            <span className="text-xs text-muted-foreground">
                              {transaction.className}
                            </span>
                          )}
                          {transaction.reference && (
                            <span className="text-xs text-muted-foreground font-mono">
                              #
                              {transaction.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount and Payment Method */}
                    <div className="text-right space-y-1">
                      <div className="font-bold text-card-foreground">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Badge
                        className={`text-xs ${getPaymentMethodColor(transaction.paymentMethod)}`}
                      >
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </CardContent>
    </Card>
  )
}
