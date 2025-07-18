import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { RegistrationStepper } from './components/RegistrationStepper'

export default function RegistrationPage() {
  const steps = [
    {
      title: 'Identification',
      description: 'Entrez le code de l\'école et la matricule de l\'élève',
    },
    {
      title: 'Confirmation',
      description: 'Vérifiez les informations de l\'école et de l\'élève',
    },
    {
      title: 'Niveau',
      description: 'Sélectionnez le niveau d\'études',
    },
    {
      title: 'Frais de scolarité',
      description: 'Consultez les frais de scolarité',
    },
    {
      title: 'Paiement',
      description: 'Effectuez le paiement des frais du premier trimestre',
    },
    {
      title: 'Succès',
      description: 'Récapitulatif de l\'inscription',
    },
  ]

  return (
    <div className={cn(
      'min-h-screen pb-4',
      'bg-gradient-to-br from-[hsl(var(--gradient-start))] via-[hsl(var(--background))] to-[hsl(var(--gradient-end))]',
    )}
    >
      <div className="container mx-auto p-4">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Yeko Logo"
            width={144}
            height={144}
            priority
            className="h-36 w-36 object-contain"
          />
        </div>
        <Card className="max-w-5xl mx-auto border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <CardHeader>
            <h1 className="text-3xl font-bold text-center text-card-foreground">
              Inscription
            </h1>
          </CardHeader>
          <CardContent>
            <RegistrationStepper steps={steps} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
