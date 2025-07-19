'use client'

import type { Student } from '../../../types'
import { Calendar, CalendarDays, FileText, GraduationCap, Home, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, getAge } from '@/lib/utils'

interface PersonalInfoProps {
  student: Student
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <span className="font-medium">
        {label}
        :
      </span>
      <span>{value}</span>
    </div>
  )
}

export function PersonalInfo({ student }: PersonalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations Personnelles</CardTitle>
        <CardDescription>Détails et informations de base de l'élève</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InfoRow
            icon={<CalendarDays className="h-5 w-5 text-muted-foreground" />}
            label="Naissance"
            value={
              student.dateOfBirth
                ? (
                    <>
                      {formatDate(student.dateOfBirth)}
                      {' '}
                      <span className="text-muted-foreground">
                        (
                        {getAge(student.dateOfBirth)}
                        {' '}
                        ans)
                      </span>
                    </>
                  )
                : 'Non renseigné'
            }
          />
          <InfoRow
            icon={<MapPin className="h-5 w-5 text-muted-foreground" />}
            label="Nationalité"
            value="Ivoirienne"
          />
          <InfoRow
            icon={<Home className="h-5 w-5 text-muted-foreground" />}
            label="Lieu d'habitation"
            value={student.address || 'Non renseignée'}
          />
        </div>
        <div className="space-y-4">
          <InfoRow
            icon={<GraduationCap className="h-5 w-5 text-muted-foreground" />}
            label="Niveau actuel"
            value={student.classroom?.name.split(' ')[0] || 'Non assigné'}
          />
          <InfoRow
            icon={<FileText className="h-5 w-5 text-muted-foreground" />}
            label="Statut"
            value={<Badge>Actif</Badge>}
          />
          <InfoRow
            icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
            label="Date d'inscription"
            value={
              student.dateJoined
                ? formatDate(student.dateJoined)
                : 'À définir'
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
