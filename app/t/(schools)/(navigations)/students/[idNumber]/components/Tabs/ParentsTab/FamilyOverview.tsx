'use client'

import { ExternalLink, GraduationCap, School, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  relationship: string
  dateOfBirth?: string
  isStudent: boolean
  schoolInfo?: {
    idNumber: string
    class: string
    school: string
  }
}

interface FamilyOverviewProps {
  members: FamilyMember[]
  onViewMember: (memberId: string) => void
  isLoading?: boolean
}

function MemberCard({ member, onView }: {
  member: FamilyMember
  onView: () => void
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium">
              {member.firstName}
              {' '}
              {member.lastName}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">
                {member.relationship}
              </Badge>
              {member.isStudent && (
                <Badge variant="secondary">
                  Élève
                </Badge>
              )}
            </div>
          </div>
          {member.isStudent && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
            >
              <School className="h-4 w-4 mr-2" />
              Voir profil
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {member.schoolInfo && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>
                Classe:
                {member.schoolInfo.class}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <School className="h-4 w-4 text-muted-foreground" />
              <span>{member.schoolInfo.school}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MemberCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <Skeleton className="h-9 w-28" />
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardContent>
    </Card>
  )
}

export function FamilyOverview({ members, onViewMember, isLoading }: FamilyOverviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vue d'Ensemble Familiale</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MemberCardSkeleton />
          <MemberCardSkeleton />
          <MemberCardSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Group members by relationship type
  const siblings = members.filter(m => m.relationship === 'sibling')
  const otherMembers = members.filter(m => m.relationship !== 'sibling')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vue d'Ensemble Familiale</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {members.length}
              {' '}
              membres
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {siblings.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Frères et Sœurs</h3>
            <div className="space-y-4">
              {siblings.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onView={() => onViewMember(member.id)}
                />
              ))}
            </div>
          </div>
        )}

        {otherMembers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Autres Membres</h3>
            <div className="space-y-4">
              {otherMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onView={() => onViewMember(member.id)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
