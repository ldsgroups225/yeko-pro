'use client'

import { AlarmClock, AlertCircle, Building2, MapPin, Phone } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface EmergencyContact {
  id: string
  type: 'doctor' | 'hospital' | 'relative'
  name: string
  role?: string
  phone: string
  address?: string
  availability?: string
  priority: number
}

interface EmergencyContactsProps {
  contacts: EmergencyContact[]
  isLoading?: boolean
}

const contactTypeIcons = {
  doctor: Building2,
  hospital: MapPin,
  relative: Phone,
}

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const Icon = contactTypeIcons[contact.type]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{contact.name}</div>
                {contact.role && (
                  <div className="text-sm text-muted-foreground">
                    {contact.role}
                  </div>
                )}
              </div>
              <Badge>
                Priorité
                {contact.priority}
              </Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>

              {contact.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.address}</span>
                </div>
              )}

              {contact.availability && (
                <div className="flex items-center gap-2">
                  <AlarmClock className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.availability}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ContactCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function EmergencyContacts({ contacts, isLoading }: EmergencyContactsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts d'Urgence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ContactCardSkeleton />
          <ContactCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts d'Urgence</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Aucun contact d'urgence renseigné
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Sort contacts by priority
  const sortedContacts = [...contacts].sort((a, b) => a.priority - b.priority)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts d'Urgence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedContacts.map(contact => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </CardContent>
    </Card>
  )
}
