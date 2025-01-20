'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Briefcase,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from 'lucide-react'
import { nanoid } from 'nanoid'

export interface ParentContact {
  id: string
  type: 'father' | 'mother' | 'guardian'
  firstName: string
  lastName: string
  profession?: string
  contacts: {
    type: 'phone' | 'email' | 'whatsapp'
    value: string
    isPreferred?: boolean
  }[]
  address?: string
  availability?: string
  preferredLanguage?: string
  lastContactDate?: string
}

interface ParentContactsProps {
  contacts: ParentContact[]
  onContactClick: (method: string, value: string) => void
  isLoading?: boolean
}

function ContactIcon({ type }: { type: string }) {
  switch (type) {
    case 'phone':
      return <Phone className="h-4 w-4" />
    case 'email':
      return <Mail className="h-4 w-4" />
    case 'whatsapp':
      return <MessageSquare className="h-4 w-4" />
    default:
      return null
  }
}

function ParentCard({ parent, onContactClick }: {
  parent: ParentContact
  onContactClick: (method: string, value: string) => void
}) {
  const fullName = `${parent.firstName} ${parent.lastName}`

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{fullName}</div>
                <Badge variant="outline" className="mt-1">
                  {parent.type === 'father' ? 'Père' : parent.type === 'mother' ? 'Mère' : 'Tuteur'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {parent.profession && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{parent.profession}</span>
                </div>
              )}

              {parent.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{parent.address}</span>
                </div>
              )}

              {parent.availability && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{parent.availability}</span>
                </div>
              )}

              <div className="pt-2 space-y-2">
                {parent.contacts.map(contact => (
                  <Button
                    key={nanoid()}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => onContactClick(contact.type, contact.value)}
                  >
                    <ContactIcon type={contact.type} />
                    <span className="ml-2">{contact.value}</span>
                    {contact.isPreferred && (
                      <Badge variant="secondary" className="ml-2">
                        Préféré
                      </Badge>
                    )}
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ParentCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-40" />

              <div className="pt-2 space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ParentContacts({ contacts, onContactClick, isLoading }: ParentContactsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contacts des Parents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ParentCardSkeleton />
          <ParentCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacts des Parents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map(parent => (
          <ParentCard
            key={parent.id}
            parent={parent}
            onContactClick={onContactClick}
          />
        ))}
      </CardContent>
    </Card>
  )
}
