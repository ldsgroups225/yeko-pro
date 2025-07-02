// app/t/(schools)/(navigations)/accounting/_components/student-information.tsx

import type { StudentForPayment } from '@/types/accounting'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface StudentInformationProps {
  student: StudentForPayment
}

export function StudentInformation({ student }: StudentInformationProps) {
  const { photo, fullName, matriculation, financialInfo } = student
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={photo} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{fullName}</h3>
            <p className="text-sm text-muted-foreground">
              Matricule:
              {' '}
              {matriculation}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total des frais de scolarité
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(financialInfo.totalTuition)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Solde restant
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(financialInfo.remainingBalance)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Paiement par tranche
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(financialInfo.installmentAmount)}
            </p>
          </div>

          {financialInfo.lastPayment && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Dernier paiement
              </p>
              <p className="text-sm">
                {formatCurrency(financialInfo.lastPayment.amount)}
                {' '}
                via
                {' '}
                {financialInfo.lastPayment.method}
                {' '}
                on
                {' '}
                {formatDate(financialInfo.lastPayment.date)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
