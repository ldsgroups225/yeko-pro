'use client'

import type { SchoolMember } from '@/services/roleManagementService'
import {
  AlertTriangle,
  Briefcase,
  Calculator,
  CheckCircle,
  Clock,
  Crown,
  MoreVertical,
  Plus,
  RefreshCw,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/hooks'
import {
  getSchoolMembers,
  removeUserFromSchool,

  updateUserRole,
} from '@/services/roleManagementService'
import { ERole, gradeToFrenchName } from '@/types'
import { ConfirmActionModal } from '../components/ConfirmActionModal'
import { InviteUserModal } from '../components/InviteUserModal'
import { OTPConfirmModal } from '../components/OTPConfirmModal'
import { ValidateOTPModal } from '../components/ValidateOTPModal'

interface RoleInfo {
  label: string
  color: string
  icon: typeof Shield
}

const ROLE_INFO: Record<ERole, RoleInfo> = {
  [ERole.DIRECTOR]: {
    label: 'Directeur',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    icon: Shield,
  },
  [ERole.TEACHER]: {
    label: 'Enseignant',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    icon: UserPlus,
  },
  [ERole.PARENT]: {
    label: 'Parent',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    icon: Users,
  },
  [ERole.CASHIER]: {
    label: 'Caissier / Caissière',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    icon: Calculator,
  },
  [ERole.EDUCATOR]: {
    label: 'Éducateur',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300',
    icon: Users,
  },
  [ERole.ACCOUNTANT]: {
    label: 'Comptable',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    icon: Briefcase,
  },
  [ERole.HEADMASTER]: {
    label: 'Direction / Proviseur',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    icon: Crown,
  },
}

const SCHOOL_YEAR_ID = 1 // TODO: Get this dynamically

export default function RoleManagementTab() {
  const { toast } = useToast()
  const { user } = useUser()
  const [members, setMembers] = useState<SchoolMember[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showValidateOTPModal, setShowValidateOTPModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'remove' | 'update-role'
    userId: string
    userName: string
    newRole?: ERole
  } | null>(null)
  const [otpData, setOTPData] = useState<{
    otp: string
    email: string
    userExists: boolean
  } | null>(null)

  const loadMembers = async () => {
    if (!user?.school?.id)
      return

    try {
      setLoading(true)
      const data = await getSchoolMembers(user.school.id, SCHOOL_YEAR_ID)
      setMembers(data)
    }
    catch (error) {
      console.error('Error loading members:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la liste des membres.',
        variant: 'destructive',
      })
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [user?.school?.id])

  const handleInviteSuccess = (otp: string, email: string, userExists: boolean) => {
    setOTPData({ otp, email, userExists })
    setShowOTPModal(true)
    setShowInviteModal(false)
    loadMembers() // Refresh the list
  }

  const handleRemoveUser = async (userId: string, userName: string) => {
    setConfirmAction({ type: 'remove', userId, userName })
    setShowConfirmModal(true)
  }

  const handleUpdateRole = async (userId: string, userName: string, newRole: ERole) => {
    setConfirmAction({ type: 'update-role', userId, userName, newRole })
    setShowConfirmModal(true)
  }

  const executeAction = async () => {
    if (!confirmAction || !user?.school?.id)
      return

    setActionLoading(confirmAction.userId)

    try {
      let result

      if (confirmAction.type === 'remove') {
        result = await removeUserFromSchool(confirmAction.userId, user.school.id)
      }
      else if (confirmAction.type === 'update-role' && confirmAction.newRole) {
        result = await updateUserRole(confirmAction.userId, confirmAction.newRole, user.school.id)
      }

      if (result?.success) {
        toast({
          title: 'Succès',
          description: result.message,
        })
        loadMembers() // Refresh the list
      }
      else {
        toast({
          title: 'Erreur',
          description: result?.message || 'Une erreur est survenue.',
          variant: 'destructive',
        })
      }
    }
    catch (error) {
      console.error('Action error:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'opération.',
        variant: 'destructive',
      })
    }
    finally {
      setActionLoading(null)
      setShowConfirmModal(false)
      setConfirmAction(null)
    }
  }

  const copyOTP = (otp: string) => {
    navigator.clipboard.writeText(otp)
    toast({
      title: 'Copié',
      description: 'Le code OTP a été copié dans le presse-papiers.',
    })
  }

  const getRoleBadge = (role: ERole | null) => {
    if (!role)
      return null
    const info = ROLE_INFO[role]
    if (!info)
      return null

    const IconComponent = info.icon

    return (
      <Badge variant="secondary" className={`inline-flex items-center gap-1 ${info.color}`}>
        <IconComponent className="h-3 w-3" />
        {info.label}
      </Badge>
    )
  }

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    return email[0].toUpperCase()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Rôles
          </CardTitle>
          <CardDescription>
            Gérez les membres de votre école et leurs rôles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestion des Rôles
              </CardTitle>
              <CardDescription>
                Gérez les membres de votre école et leurs rôles pour l'année scolaire en cours
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowInviteModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Inviter un membre
              </Button>
              <Button variant="outline" onClick={() => setShowValidateOTPModal(true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Valider OTP
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Directeurs</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {members.filter(m => m.primaryRole === ERole.DIRECTOR).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Autres rôles</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {members.filter(m => m.primaryRole !== ERole.DIRECTOR).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <p className="text-2xl font-bold">{members.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Members Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Ajouté le</TableHead>
                    <TableHead>Dernière activité</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Aucun membre trouvé. Commencez par inviter des membres à votre école.
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        members.map(member => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={member.avatarUrl || undefined} />
                                  <AvatarFallback>
                                    {getInitials(member.firstName, member.lastName, member.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.fullName}</p>
                                  <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getRoleBadge(member.primaryRole)}
                            </TableCell>
                            <TableCell>
                              {member.grade ? gradeToFrenchName[member.grade] : 'Tout'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {member.lastActiveAt
                                  ? new Date(member.lastActiveAt).toLocaleDateString('fr-FR')
                                  : 'Jamais'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={actionLoading === member.id}
                                  >
                                    {actionLoading === member.id
                                      ? (
                                          <RefreshCw className="h-4 w-4 animate-spin" />
                                        )
                                      : (
                                          <MoreVertical className="h-4 w-4" />
                                        )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {member.primaryRole !== ERole.DIRECTOR && (
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateRole(member.id, member.fullName, ERole.DIRECTOR)}
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Promouvoir directeur
                                    </DropdownMenuItem>
                                  )}
                                  {member.primaryRole === ERole.DIRECTOR && members.filter(m => m.primaryRole === ERole.DIRECTOR).length > 1 && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleUpdateRole(member.id, member.fullName, ERole.TEACHER)}
                                      >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Changer en enseignant
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleUpdateRole(member.id, member.fullName, ERole.PARENT)}
                                      >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Changer en parent
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleRemoveUser(member.id, member.fullName)}
                                    disabled={member.id === user?.id}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Retirer de l'école
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InviteUserModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={handleInviteSuccess}
        schoolId={user?.school?.id || ''}
      />

      <ConfirmActionModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setConfirmAction(null)
        }}
        onConfirm={executeAction}
        title={confirmAction?.type === 'remove' ? 'Confirmer la suppression' : 'Confirmer le changement de rôle'}
        description={
          confirmAction?.type === 'remove'
            ? `Êtes-vous sûr de vouloir retirer "${confirmAction.userName}" de l'école ? Cette action est irréversible.`
            : `Êtes-vous sûr de vouloir changer le rôle de "${confirmAction?.userName}" ?`
        }
        confirmText={confirmAction?.type === 'remove' ? 'Retirer' : 'Changer le rôle'}
        variant={confirmAction?.type === 'remove' ? 'destructive' : 'default'}
        isLoading={actionLoading !== null}
      />

      <ValidateOTPModal
        isOpen={showValidateOTPModal}
        onClose={() => setShowValidateOTPModal(false)}
        onSuccess={loadMembers}
      />

      <OTPConfirmModal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false)
          setOTPData(null)
        }}
        otp={otpData?.otp || ''}
        email={otpData?.email || ''}
        userExists={otpData?.userExists || false}
        onCopyOTP={copyOTP}
      />
    </>
  )
}
