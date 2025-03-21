import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PaymentStepper } from './components/PaymentStepper'

export default function PaymentsPage() {
  const steps = [
    {
      title: 'Recherche',
      description: 'Entrez la matricule de l\'élève et le code de l\'école',
    },
    {
      title: 'Vérification',
      description: 'Vérifiez les informations de l\'élève et de l\'école',
    },
    {
      title: 'Sélection du niveau',
      description: 'Choisissez le niveau et consultez la scolarité',
    },
    {
      title: 'Paiement',
      description: 'Entrez vos informations de paiement Mobile Money',
    },
    {
      title: 'Confirmation',
      description: 'Vérifiez et confirmez le paiement',
    },
  ]

  return (
    <div className={cn(
      'min-h-screen pb-4',
      'bg-gradient-to-br from-[hsl(var(--gradient-start))] via-[hsl(var(--background))] to-[hsl(var(--gradient-end))]',
    )}
    >
      <div className="container mx-auto p-4">
        <Card className="max-w-5xl mx-auto border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center text-card-foreground">
              Portail de paiement
            </h1>
          </CardHeader>
          <CardContent>
            <PaymentStepper steps={steps} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
