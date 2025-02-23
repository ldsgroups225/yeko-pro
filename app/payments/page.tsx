import type { Database } from '@/lib/supabase/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PaymentStepper } from './components/PaymentStepper'

interface IStudent {
  id: string
  idNumber: string
  firstName: string
  lastName: string
  address: string | null
  gender: string | null
  birthDate: string | null
  avatarUrl: string | null
  parentId: string
  classId: string | null
  gradeId: number | null
  schoolId: string | null
  createdAt: string | null
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

interface ISchool {
  id: string
  code: string
  name: string
  address: string | null
  imageUrl: string | null
  city: string
  email: string
  cycleId: string
  isTechnicalEducation: boolean | null
  phone: string
  stateId: number | null
  createdAt: string | null
  updatedAt: string | null
  createdBy: string | null
  updatedBy: string | null
}

export {
  type ISchool,
  type IStudent,
}

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
      title: 'Sélection de classe',
      description: 'Choisissez la classe et consultez les frais de scolarité',
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
      'min-h-screen pb-8',
      'bg-gradient-to-br from-[hsl(var(--gradient-start))] via-[hsl(var(--background))] to-[hsl(var(--gradient-end))]',
    )}
    >
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto border-none bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
