import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit2Icon, Trash2Icon } from 'lucide-react'

export interface PaymentPlanSectionProps {
  totalAmount: number
  amountPaid: number
  dummyStatus: 'pending' | 'partial' | 'paid' | 'overdue'
  showAddInstallment: boolean
  setShowAddInstallment: (show: boolean) => void
}

export function PaymentPlanSection({
  totalAmount,
  amountPaid,
  dummyStatus,
  showAddInstallment,
  setShowAddInstallment,
}: PaymentPlanSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tranches de paiement</h3>
        <Button variant="outline" onClick={() => setShowAddInstallment(true)}>
          Ajouter une tranche
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date limite</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>30 Sept 2024</TableCell>
              <TableCell>100,000 FCFA</TableCell>
              <TableCell>
                <Badge
                  variant={
                    dummyStatus === 'paid'
                      ? 'success'
                      : dummyStatus === 'overdue'
                        ? 'destructive'
                        : 'default'
                  }
                >
                  {dummyStatus === 'paid'
                    ? 'Payé'
                    : dummyStatus === 'overdue'
                      ? 'En retard'
                      : 'En attente'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button size="icon" variant="ghost">
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="rounded-md border p-4 bg-muted/50">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Montant total</span>
            <span className="font-medium">
              {new Intl.NumberFormat('fr-FR').format(totalAmount)}
              {' '}
              FCFA
            </span>
          </div>
          <div className="flex justify-between">
            <span>Montant payé</span>
            <span className="font-medium">
              {new Intl.NumberFormat('fr-FR').format(amountPaid)}
              {' '}
              FCFA
            </span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Reste à payer</span>
            <span className="font-medium">
              {new Intl.NumberFormat('fr-FR').format(totalAmount - amountPaid)}
              {' '}
              FCFA
            </span>
          </div>
        </div>
      </div>
      <Dialog open={showAddInstallment} onOpenChange={setShowAddInstallment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une tranche</DialogTitle>
            <DialogDescription>
              Définissez les détails de la nouvelle tranche de paiement
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <label>Date limite</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label>Montant (FCFA)</label>
              <Input type="number" min="0" />
            </div>
            <DialogFooter>
              <Button type="submit">Sauvegarder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
